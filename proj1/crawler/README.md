We're gonna need to make sure that we have Miniconda installed, we'll be using this going forward instead of pip
Allow it to set the PATH variable if it asks you
https://docs.conda.io/projects/conda/en/latest/user-guide/install/windows.html

Unfortunately even though pip allows you to try and install scrapy it doesn't actually work so that's why we're on conda
after installing that run this from this folder
* conda env create -f environment.yml

Install dependencies:
* pip install Scrapy
* pip install BeautifulSoup4

To run the spider/crawler
* cd src
* scrapy crawl url -a url=https://utsc.utoronto.ca/ -s DEPTH_LIMIT=2

To run test.ps1 (Powershell script) ensure a fresh instance of the indexer is up and running then from src:
* powershell -ExecutionPolicy bypass -File ./test_CrawlerViaScrapyCrawl.ps1