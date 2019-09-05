# -*- coding: utf-8 -*-

# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://doc.scrapy.org/en/latest/topics/item-pipeline.html
import requests
import sys
import os

class CrawlerPipeline(object):
    def process_item(self, item, spider):
        return item

    def close_spider(self, spider):
        spider.f.close()  # close the file

        if os.path.getsize(spider.filePath) > 0:
            # call to indexer
            filePath = spider.file_name
            try :
                r = requests.post("http://localhost:1021/search", data={"field":"0", "docName":filePath})
                if (r.status_code == 200):
                	print("{ \"success\" : true, "
                		+ "\"reason\": \"Succesfully crawled " + spider.url + "\"}")
                else:
                	print("{ \"success\" : false,"
                	 		+ "\"reason\" : \"Response from indexer not OK\"}", file=sys.stderr)

            except :
                print("{ \"success\" : false,"
                	 		+ "\"reason\" : \"Connection to indexer failed\"}", file=sys.stderr)
        else:
            print("{ \"success\" : false,"
                	 		+ "\"reason\" : \"Couldn't extract information from the given URL,"
                			+ " please ensure the url " + spider.url + " is correct\"}", file=sys.stderr)
