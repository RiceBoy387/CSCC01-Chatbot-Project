import scrapy
from bs4 import BeautifulSoup
import time
import os
import platform
import datetime


class UrlSpider(scrapy.Spider):
    name = "url"
    f = None
    baseURL = None
    # this is the default setting, please set depth in the command line args
    custom_settings = {
        'DEPTH_LIMIT': 3,  # sets a recursive depth limit for the spider
    }
    file_name = None
    file_dir = "/samples/"

    def start_requests(self):
        # a command line argument will pass in a value for this,
        if not (self.url.startswith("https://") or self.url.startswith("http://")):
            if (self.url.startswith("//")):
                url = "https:" + self.url
            elif (self.url.startswith("/")):
                url = "https:/" + self.url
            else:
                url = "https://" + self.url
        else:
            url = self.url
        
        # get the baseURL to use for file name and control where the spider goes
        self.baseURL = spiderUtils.getBaseURL(url)
        
        # grab the date and name the file
        self.file_name = spiderUtils.createFileName(self.baseURL)

        # obtain an absolute path to the file for the current OS 
        self.filePath = spiderUtils.mountD(self.file_dir + self.file_name)

        # open the file
        self.f = spiderUtils.getOutputFile(self.filePath)

        # start our scraping
        yield scrapy.Request(url=url, callback=self.parse)

    def parse(self, response):
        if (self.baseURL in response.request.url):
            stamp = time.time_ns()
            page_content = BeautifulSoup(response.body, "html.parser")
            # grabs paragraph content
            text_content = page_content.find_all("p")
            # grabs other links
            link_content = page_content.find_all("a", href=True)
            # grabs addresses
            address_content = page_content.find_all("address")
            
            title_content = page_content.find("title")
            for title in title_content:
                self.f.write("(" + str(stamp) + "-title) " + title.strip() + "\n")

            # write the paragraph content to the output file
            for paragraphs in text_content:
                curr_para = paragraphs.text.replace("\n", " ").strip()
                if (curr_para != ""):
                    self.f.write("(" + str(stamp) + ") " + curr_para.replace("\t", " ").replace("  ", " ") + "\n")
            # write the address content to the output file
            for address in address_content:
                curr_address = address.text.replace("\n", " ").replace("\t", " ").replace("  ", " ").strip()
                if (curr_address != ""):
                    self.f.write("(" + str(stamp) + ") " + curr_address + "\n")
            self.f.write("(" + str(stamp) + "-link) " + response.request.url + "\n\n")
            # employ solution here that will traverse through the links
            if (int(self.settings["DEPTH_LIMIT"]) > 0):
                for links in link_content:
                    next_page = links["href"]
                    if ((next_page[0] == '/' or self.baseURL in next_page) and 
                        (".pdf" not in next_page) and (".exe" not in next_page)):
                        yield response.follow(next_page, self.parse)


class spiderUtils():
    def getOutputFile(file_path):
        '''() -> file
        Creates a file in the output folder to put scraped contents in
        '''
        f = open(file_path, "a+")
        return f

    def createFileName(baseURL):
        '''(String) -> String
        Generates the filename given the baseURL by attaching a time stamp to it
        '''
        date = datetime.datetime.today()
        return baseURL + "-" + date.strftime("%m-%d-%Y-Time-%H-%M-%S") +".txt"

    def getBaseURL(url):
        '''(String) -> String
        Extract the baseURL (domain) from the given url
        '''
        if not url.endswith("/"): url += "/"
        baseStart = url.find("//") + 2
        baseEnd = url[baseStart::].find("/")
        return url[baseStart:baseStart+baseEnd]

    def mountD(path):
        '''(String) -> String
        Given a file path starting with /, will return the file path with the format
        for the current OS and mount the d/D: drive.
        '''
        path = os.path.normpath(os.path.expanduser(path))
        OS = platform.system()

        if OS.lower() == "windows":
            path = "D:" + path
        elif OS.lower() == "linux":
            path = "/mnt/d" + path
        elif OS.lower() == "darwin":  # macOS
            path = "/Volumes/d" + path
        return path