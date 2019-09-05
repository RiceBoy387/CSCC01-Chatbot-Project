package docIndexer;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.lucene.document.Document;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.index.IndexReader;
import org.apache.lucene.queryparser.classic.ParseException;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.ScoreDoc;
import org.apache.lucene.search.TopDocs;

@WebServlet("/search")
public class IndexSrv extends HttpServlet{
	// default path with respect to the environment of the server
	// (i.e. Ubuntu, Windows, WSL)
	// private static String defaultPath = "/mnt/d/samples/"; 
	private static String defaultPath = "D:/samples/"; 
	// private static String defaultPath = "~/samples/";
	
	/*
	 * return the default path of the running environment
	 */
	public static String getDefaultPath() {
		return defaultPath;
	}

	private static final long serialVersionUID = 1L;
	private docIndexer index = null;
	
    public void init(ServletConfig config1) throws ServletException {
	    super.init(config1);
	}

    /*
     * query the DFI index to get the full answer with respect to the question
     */
    private String getDFIAns(String question, String field)
    		throws ParseException, IOException {
    	String out = "";
    	// get the question number
    	String ansQuery = "ANSWER " + question.substring
    			(question.indexOf(" ") + 1, question.indexOf(")"));
    	// search for the answer to this question
    	ArrayList<String> queryResult = this.index.queryFields
    			(field, ansQuery, 10);
    	for (int i = 0; i < queryResult.size(); i++) {
    		if (queryResult.get(i).contains(ansQuery)) {
    			out += "    " + queryResult.get(i).substring
    					(queryResult.get(i).indexOf(")") + 1,
    							queryResult.get(i).length()) + "\n";
    		}
    	}
		return out;
    }
    
    /*
     * query the crawled index to get the full answer with respect to the
     * question of the query after the result of DFI is not found
     */
    private ArrayList<String> getCorpusAns(String question, String field)
    		throws ParseException, IOException {
    	ArrayList<String> out = new ArrayList<String>();
    	String title = "";
    	String link = "";
    	// get the question number
    	String ansQuery = question.substring
    			(question.indexOf("(") + 1, question.indexOf(")"));
    	// search for the answer to this question
    	ArrayList<String> queryResult = this.index.queryFields
    			(field, ansQuery, 25);
    	for (int i = 0; i < queryResult.size(); i++) {
    		if (queryResult.get(i).contains("title")) {
    			title = queryResult.get(i);
    		}
    		if (queryResult.get(i).contains("link")) {
    			link = queryResult.get(i);
    		}
    	}
    	out.add(title.substring(title.indexOf(")") + 1, title.length()));
    	out.add(link.substring(link.indexOf(")") + 1, link.length()));
		return out;
    }
    
    /*
     * HTTP get command for searching the indexer
     */
	@Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) {
    //     throws ServletException, IOException {
		try {
	        resp.setContentType("text/plain");
	        // string for the response to the user 
	        String res = "";
	        
	        // get the variables for the field to query and the number of results
	        String querystr = req.getParameter("query");
	        String field = req.getParameter("field");
	        Integer numResult = Integer.parseInt(req.getParameter("numRes"));
	        ArrayList<String> ids = new ArrayList<String>();
        
        	// query the index
			ArrayList<String> queryResult = this.index.queryFields
					(field, querystr, numResult);

			// for every result, get the answer
			if (field.contains("DFI")) {
				for (int i = 0; i < queryResult.size(); i++) {
					// get the id of this query result
					String id = queryResult.get(i).substring
							(queryResult.get(i).indexOf(" ") + 1,
									queryResult.get(i).indexOf(")"));
					// if the result has not been parsed
					if ((!ids.contains(id)) 
							&& (queryResult.get(i).contains("QUESTION"))) {
						ids.add(id);
						// add the ID to ids for the parsed ids
						// output the top query results
						res += Integer.toString(i) + ") " + queryResult.get
								(i).substring(queryResult.get(i).indexOf(")")
										+ 1, queryResult.get(i).length())
								+ "\n";
						res += getDFIAns(queryResult.get(i), field);
					}
				}
			} else {
				// not a DFI query
				for (int i = 0; i < queryResult.size(); i++) {
					// get the id of this result
					String id = queryResult.get(i).substring(queryResult.get
							(i).indexOf("(") + 1, queryResult.get
							(i).indexOf(")"));
					// if the result has not been parsed
					if (!ids.contains(id)) {
						ids.add(id);
						// get the link and title from the crawled corpus
						ArrayList<String> queryData = getCorpusAns
								(queryResult.get(i), field);
						res += Integer.toString(i) + ") " 
								+ queryData.get(0) + "\n";
						res += "    " + queryResult.get(i).substring
								(queryResult.get(i).indexOf(")") + 1, 
										queryResult.get(i).length()) + "\n";
						res += "    " + queryData.get(1) + "\n";
					}
				}
			}
			resp.setStatus(200);
			resp.getWriter().write(res);
		} catch (Exception e) {
			resp.setStatus(400);
			e.printStackTrace();
			
		}
        
    }
	
	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) {
		try {
			// get the document name and the mode
			String docName = req.getParameter("docName");
			String field = req.getParameter("field");
			
			// if the field is DFI, flush the field first
			if (field.contains("DFI")) {
				this.index.deleteDoc(field, "*");
			}
			
			// read the document
			ArrayList<String> document = this.readDoc(this.defaultPath + docName);
			
			// for every line in the document
			for (int i = 0; i < document.size(); i++) {
				// add this line to the index
				this.index.indexDoc(field, document.get(i));
			}
			resp.setStatus(200);
		} catch (Exception e) {
			e.printStackTrace();
			resp.setStatus(400);
		}
	}
	
	
	@Override
	protected void doDelete(HttpServletRequest req, HttpServletResponse resp) {
		// try to delete both DFI and crawled corpus
		try {
			this.index.deleteDoc("DFI", "*");
			this.index.deleteDoc("0", "*");
			resp.setStatus(200);
		} catch (Exception e) {
			e.printStackTrace();
			resp.setStatus(400);
		}
	}

	// open file and read
	public static ArrayList<String> readDoc(String filePath) {
		// read the document to be parsed
		File input = new File(filePath);
		ArrayList<String> linesArray = new ArrayList<String>();
		try {
			Scanner lines = new Scanner(input);
			String curLine;
			// parse each line that is not empty
			while (lines.hasNextLine()) {
				curLine = lines.nextLine();
				if (curLine.matches(".*[a-zA-Z]+.*") || curLine.matches
						(".*\\d.*")) {
					linesArray.add(curLine);
				}
		    }
			lines.close();
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		}
		return linesArray;
	}
	
	// analyze the lines
	public void indexText(ArrayList<String> document, String field)
			throws IOException {
		// index the document line by line
		for (int i = 0; i < document.size(); i++) {
			this.index.indexDoc(field, document.get(i));
		}
	}

	public IndexSrv() {
		try {
			this.index = new docIndexer();
			/*this.index.writeSample();
			 */
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	public static void main(String[] args) throws IOException, ParseException {

	}

}
