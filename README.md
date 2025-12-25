# AI Blogs Content Enhancer For Targeted Keyword.

This is a Full Stack Application Project built using Next.js Node.js/Express Laravel. (Assignment Prject from BeyondChats)


## Live Project Link

Frontend - [https://shubh-beyondchat.vercel.app/](https://shubh-beyondchat.vercel.app/)

Backend (Laravel) - [https://laravel-api-render.onrender.com/](https://laravel-api-render.onrender.com/)

Backend API (Node.js/Express) - [https://node-api-ejor.onrender.com/](https://node-api-ejor.onrender.com/)




### Important Notes (Instructions) before using live links:

1. The backends servers are hosted on free tier Render platform, so they shuts down after 30 minutes of inactivity. So, please hit these 2 links one after another before accessing the Frontend application.

* Laravel Server Test - [https://laravel-api-render.onrender.com/api/test](https://laravel-api-render.onrender.com/api/test) 
(Returns Hello in JSON format)
* Node.js Server Test - [https://node-api-ejor.onrender.com/api/](https://node-api-ejor.onrender.com/api/)
(Returns List of Articles data in JSON format)



## Local Setup Guide (Instructions)

1. Clone the repository.

(Laravel Setup)
2. Navigate to the Laravel project directory - /laravel-api.
3. Install dependencies: composer install
4. Copy .env.example to .env and configure the database connection (use SQLite for local development).
5. Run migrations: php artisan migrate
6. Start the Laravel development server: php artisan serve

(Node.js Setup)
2. Navigate to the Node.js project directory - /node-api.
3. Install dependencies: npm install
4. Copy .env.example to .env and configure the database connection (change the urls according to your local setup).
5. You will need Gemini API Key (google ai studio) and Search API Key (serpapi.com). 
6. Start the Node.js development server: npm run dev or node index.js.

(Frontend Setup)
2. Navigate to the Frontend project directory - /my-app.
3. Install dependencies: npm install
4. Copy .env.example to .env and configure the database connection (change the urls according to your local setup).
5. Start the Frontend development server: npm run dev.




### Important Notes (Instructions) before using local setup:

1. The Homepage(my-app) will show No articles Found. because the articles data is empty inside SQLite database. so you need to add them by navigating to the localhost/my-app/(link to local frontend application) click on Dashboard button from Navbar or manually add path /dashboard to the URL.

2. On Dashboard page, you will see a Input Url field and Add Blog Button. Enter the url of the article you want to add and click on Add Blog Button.

3. The article data will be fetched from the API and the blog content will be scrapped using Laravel and stored in the SQLite database. and you will see a alert message "Blog Added Successfully".

4. Repeat these process to add 4-5 articles.

5. On this Dashbord page you can see list of blogs card with 2 status as Targeting and Content as either Pending or Done. This is shows what part of the article is done. Targeting is for reading the article content and providing it to an LLM to get the best possible google keywords for the article. Content is for reading the article content and providing it to an LLM to get with the targeting keyword we got from targeting and with top 2 serch results blogs content as reference to get the best possible content for the article. Accordingly you can click on the Buttons to perform these actions.

6. After a few articles with staus as - Targeting and Content as Done, you can navigate to the Homepage(my-app) and you will see the list of articles with their targeting keywords and content. You can visit any article by clicking on the article card.

7. On the blogs page you will see a Tabular Navigation Bar on the bottom center. With that you can see the Original Blog/Article Content, Updated/ AI Enhanced Content, and Targeting Keywords Analysis.

----




## About Project

![Raw Entities Architecture State](https://res.cloudinary.com/dx7zhktvq/image/upload/v1766656253/stock/th/Screenshot_2025-12-25_at_3.19.41_PM_vv6kqc.png)


### About Laravel Backend

- It has the direct access to the DB (Neon DB on Prod.)

- Used to populate the articles via `/api/article` route:
  1. It recieves a blog URl and then we scrape theblogs main content via Readability with the help of FiveFilters Readability library.
  2. Then we convert that content to markdown using League HTML to Markdown library. (As this contend will be displayed in the frontend and also we will feed it to an LLM this makes the other tasks more easier for us)
  3. We get all the essential data from the blog and store it in the DB (Title, Content, Source URL, Cover Image, etc).

- Used to update the articles via `/api/article/{slug}` route:
  1. It receives the slug and the data to update which can be either targeting (Keywords Targeting) or content (Ai Updated Content).
  2. It updates the article in the DB with the new data.

- Used to delete the articles via `/api/article/{slug}` route:
  1. It receives the slug and deletes the article from the DB.

- Used to get the articles via `/api/all` route:
  1. It returns all the articles from the DB. (With essential data to be populated at frontend/dashboard page)

- Used to get the article via `/api/article/{slug}` route:
  1. It receives the slug and returns the article from the DB.

- For testing the API routes, you can use the `/api/test` route.


### About Node.js Backend

- It has the access to the LLM API. Mainly used to get the targeting keywords and updated content for the articles.

- Used to get the targeting keywords via `/article/targeting/:slug` route: (Targeting)
  1. It receives the article's slug. then fetches the article content from Laravel Backend.
  2. Then it sends the article content to the LLM API and gets the targeting keywords.
  3. Then it updates the article with the Laravel Update Article Route.

- Used to get the updated content via `/article/updated/:slug` route: (Update Content)
  1. It receives the article's slug. then fetches the article content and targeting keyword from Laravel Backend.
  2. Then it uses the serpapi to fetch top 5-6 results (with basic filter to look blog or article in the results url) for the Keyword data received.
  3. With help of jsdom and @mozilla/readability it tries to scrape the content of the 5-6 results and get the content of first 2 scraped results. (the reson behind addding 5-6 results is some of the blogs add cloudflare or other security measures to prevent scraping.. so we try to scrape the scrappable content amoung them.)
  4. Then it sends the article content, targeting keyword and scraped content to the LLM API and gets the updated content.
  5. Then it updates the article with the Laravel Update Article Route.

- Used to get the original article via `/article/original/:slug` route: (Original)
  1. It receives the article's slug. then fetches the article content from Laravel Backend.
  2. Then it returns the article content.

- Used to get all articles via `/article/all` route: (All)
  1. It returns all the articles from the Laravel API.


### About Nextjs Frontend

- It has the access to the Laravel API. Mainly used to get the articles and display them in the frontend, and the Node API to make the Dashbord route functional.

- Dashboard Page: (Clent Side Rendered.)
  1. It has a Input Url field and Add Blog Button. Enter the url of the article you want to add and click on Add Blog Button. which will hit Laravel API.
  2. List of blogs will be displayed in the table below the input field. 
  3. Blog card will have 2 buttons Targeting and Content. Conditinally rendered to first generate Targeting and then Content.
  4. Blogs also have the status flgs to see if the Targeting generaation and content generation is done or not.
  5. According to successful generation of Targeting, Content and Blog insertion it will hit an next api with a route field to revalidate that page.(On demand SSR)

- Homepage: (Server Side Rendered - On intial request)
    1. It will fetch all the articles from Laravel API and display them.
    2. Clicking on any article will navigate to that specific blog page with original content.

- Blog Page: (Server Side Rendered - On intial request)
    1. It will fetch the article from Laravel API and display it.
    2. It recieves the markdown content of the article and converts it to html using react-markdown and remark-gfm.
    3. It will have a tabular navigation bar on the bottom center. With that you can see the Original Blog/Article Content, Updated/ AI Enhanced Content, and Targeting Keywords Analysis.

- Blog Page - Updated Content: (Server Side Rendered - On intial request)
    1. It will fetch the article from Laravel API and display it.
    2. It recieves the markdown content of the article and converts it to html using react-markdown and remark-gfm.
    3. It will have a tabular navigation bar on the bottom center. With that you can see the Original Blog/Article Content, Updated/ AI Enhanced Content, and Targeting Keywords Analysis.

- Targeting Keywords Analysis: (Server Side Rendered - On intial request)
    1. It will fetch the article from Laravel API and display it.
    2. It will have a tabular navigation bar on the bottom center. With that you can see the Original Blog/Article Content, Updated/ AI Enhanced Content, and Targeting Keywords Analysis.





