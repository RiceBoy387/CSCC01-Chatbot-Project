package docIndexer;

import java.io.*;
import java.util.*;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/*
 * formatter for updating the DFI corpus in the indexer
 */
@WebServlet("/update")
public class Formatter extends HttpServlet{
	
	private static final long serialVersionUID = 1L;
	private String srcPath = "";
	private String outPath = "";

	/*
	 * initialize the source and output path of the corpus
	 */
	public void init(ServletConfig config1) throws ServletException {
	    super.init(config1);
	    this.srcPath = IndexSrv.getDefaultPath() + "DFI/";
	    this.outPath = IndexSrv.getDefaultPath();
	}
	
	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) {
		
		// Put in try block incase can't get file 
		
		try {
			//Get the corpus file 
			String fileName = this.srcPath + "dfi.txt";
			File file = new File(fileName);
			// Create the new file 
			FileWriter writer = new FileWriter
					(this.outPath + "/newCorpus.txt");
			
			// Scan the file 
			Scanner scan = new Scanner(file);
			String line = "";
			
			// Run a loop to go through the file 
			while (scan.hasNextLine()) {
				
				line = scan.nextLine();
				
				// Find the question # 
				int foundEnd = line.indexOf(".");
				if (foundEnd != -1) {
					String questNum = line.substring(0, foundEnd);
					String question = "(QUESTION " + questNum + ") "
					+ line.substring(foundEnd+2);
					
					// Write the question 
					writer.write(question+"\n");
					
					// Run another while loop until finished with this Q&A
					line = scan.nextLine();
					String answer = "(ANSWER " + questNum + ") ";
					while (!line.isEmpty()) {
						answer += line;
						line = scan.nextLine();
					}
					// Write the answer
					writer.write(answer+"\n\n");

				}	
			}
			// Close scanner and writer
			scan.close();
			writer.close();
			// run the command to post the DFI corpus
			String cmd = "curl -XPOST localhost:1021/search -d field=DFI -d"
					+ " docName=newCorpus.txt";
			Process process = Runtime.getRuntime().exec(cmd);
			resp.setStatus(200);
		}catch(Exception e) {
			resp.setStatus(400);
			e.printStackTrace();
		}
	}

}
