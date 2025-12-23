<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use fivefilters\Readability\Configuration;
use fivefilters\Readability\Readability;
use Symfony\Component\DomCrawler\Crawler;
use League\HTMLToMarkdown\HtmlConverter;

use Carbon\Carbon;


class ScraperService
{
    private function extractMeta(string $html): array
    {
        $crawler = new Crawler($html);

        $getMeta = function (string $key, string $attr = 'name') use ($crawler) {
            try {
                return $crawler
                    ->filter("meta[$attr='$key']")
                    ->first()
                    ->attr('content');
            } catch (\Throwable $e) {
                return null;
            }
        };

        return [
            'meta_description' =>
                $getMeta('description')
                ?? $getMeta('og:description', 'property'),

            'og_image' => $getMeta('og:image', 'property'),

            'og_title' => $getMeta('og:title', 'property'),
            'author' => $getMeta('article:author', 'property'),
            'published_at' => $getMeta('article:published_time', 'property'),
        ];
    }


    public function scrape(string $url): ?array
    {

        $converter = new HtmlConverter([
            'header_style' => 'atx',
            'bold_style' => '**',
            'italic_style' => '*',
            'strip_tags' => true,
            'remove_nodes' => 'script style noscript',
        ]);

        try {
            $response = Http::timeout(15)->get($url);

            if (!$response->successful()) {
                return null;
            }

            $html = $response->body();

            // 1. Extract META first
            $meta = $this->extractMeta($html);

            // 2. Extract readable content
            $config = new Configuration();
            $config->setFixRelativeURLs(true);
            $config->setOriginalURL($url);

            $readability = new Readability($config);
            $readability->parse($html);

            $contentHtml = trim($readability->getContent());

            $content = $converter->convert($contentHtml);

            if (empty($content)) {
                return null;
            }

            $publishedAt = null;

            if ($meta['published_at']) {
                $publishedAt = Carbon::parse($meta['published_at'])->toDateTimeString();
            } else {
                $publishedAt = Carbon::now()->toDateTimeString();
            }

            return [
                'title' => $readability->getTitle() ?? $meta['og_title'],
                'description' => $meta['meta_description'],
                'cover_image' => $meta['og_image'],
                'content' => $content,
                'source_original_url' => $url,
                'author' => $meta['author'],
                'published_at' => $publishedAt,
            ];

        } catch (\Throwable $e) {
            logger()->error('Scraper failed', [
                'url' => $url,
                'error' => $e->getMessage()
            ]);

            return null;
        }
    }

}
