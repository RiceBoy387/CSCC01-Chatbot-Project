import unittest
from crawler.spiders.url_spider import spiderUtils
import datetime
import platform


class TestUtils(unittest.TestCase):
    
    def test_getOutputFile(self):
        path = "test"
        f = spiderUtils.getOutputFile(path)
        self.assertTrue(f is not None)
        f.close()
    
    def test_createFileName(self):
    	date = datetime.datetime.today()
    	baseName = "example.com"
    	fileName = spiderUtils.createFileName(baseName)
    	expected = baseName + "-" + date.strftime("%m-%d-%Y-Time-%H-%M-%S") +".txt"
    	self.assertEqual(expected, fileName)

    def test_getBaseUrl_https_end_slash(self):
    	url = "https://example.com/"
    	expected = "example.com"
    	returned = spiderUtils.getBaseURL(url)
    	self.assertEqual(expected, returned)

    def test_getBaseURL_https_no_end_slash(self):
    	url = "https://example.com"
    	expected = "example.com"
    	returned = spiderUtils.getBaseURL(url)
    	self.assertEqual(expected, returned)

    def test_mntD(self):
    	OS = platform.system()
    	if (OS.lower() == "windows"):
    		expected = "D:\\test"
    	elif (OS.lower() == "linux"):
    		expected = "/mnt/d/test"
    	else:  # OS.lower() == "darwin":  # macOS
    		expected = "/Volumes/d/test"
    	returned = spiderUtils.mountD("/test")
    	self.assertEqual(expected, returned)

if __name__ == "__main__":
    unittest.main(exit=False)