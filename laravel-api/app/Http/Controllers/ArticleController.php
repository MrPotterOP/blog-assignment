<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Article;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

use App\Services\ScraperService;
use Illuminate\Http\JsonResponse;

class ArticleController extends Controller
{
    public function index()
    {
        $articles = Article::all();
        // return articles with fields - title, slug, description, cover_image, published_at
        $articles = $articles->map(function ($article) {
            return [
                'title' => $article->title,
                'slug' => $article->slug,
                'description' => $article->description,
                'cover_image' => $article->cover_image,
                'published_at' => $article->published_at,
            ];
        });
        return response()->json($articles);
    }

    public function store(Request $request, ScraperService $scraper): JsonResponse
    {
        if (!$request->filled('url')) {
            return response()->json([
                'message' => 'URL is required'
            ], 422);
        }

        $scrapedData = $scraper->scrape($request->url);

        if (!$scrapedData) {
            return response()->json([
                'message' => 'Failed to scrape article'
            ], 400);
        }

        try {
            Article::create($scrapedData);
            return response()->json([
                'message' => 'Article created successfully',
                'data' => $scrapedData
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'message' => 'Failed to create article',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    public function show($slug)
    {
        $article = Article::where('slug', $slug)->first();
        return response()->json($article);
    }

    public function update(Request $request, $slug)
    {
        $article = Article::where('slug', $slug)->first();

        if (!$article) {
            return response()->json([
                'message' => 'Article not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'updated_content' => 'sometimes|required|string',
            'source_references' => 'sometimes|array',
            'source_references.*' => 'url',
            'targeting' => 'sometimes|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Only update allowed fields
        $article->update($validator->validated());

        return response()->json([
            'message' => 'Article updated successfully',
            'data' => $article
        ]);
    }

    public function destroy($slug)
    {
        $article = Article::where('slug', $slug)->first();
        $article->delete();
        return response()->json([
            'message' => 'Article deleted successfully',
            'data' => $article
        ]);
    }

}
