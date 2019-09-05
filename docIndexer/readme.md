run on terminal:
mvn install
under /target/site:
	a webpage is generated to show test coverages

Run the following CLI command to run the server:
	mvn tomcat7:run -X
	
Example of a query with the indexed sample on browser:
	http://localhost:1021/search?query=lucene&field=title

Terminal:
	curl -XPOST localhost:1021/search -d field=0 -d docName=sample.txt
	curl -XGET -G localhost:1021/search -d query=Computer%20mathematical%20science -d field=0 -d numRes=10
	
	to update the DFI corpus:
		curl -XPOST localhost:1021/update
		
	curl -XGET -G localhost:1021/search -d query=what%20is%20Fintech -d field=DFI -d numRes=10
