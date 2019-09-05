package docIndexer;

import org.apache.lucene.document.Document;

import org.junit.Test;
import static org.junit.Assert.*;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;

import org.apache.lucene.queryparser.classic.ParseException;
import org.junit.Before;


/*
 * run this with the indexer running in the background
 * there must be a folder that include the dfi corpus
 * in the specified locations for the corpus
 */
public class EmptyTest {

	// setup before the run of every test
	@Before
	public void setup() throws IOException {
		String cmd = "curl -XDELETE localhost:1021/search";
		Process process = Runtime.getRuntime().exec(cmd);
	}
	
	
	/*
	 * nothing should be indexed in the DFI corpus
	 */
	@Test
	public void testEmptyDFI() throws ParseException, IOException, InterruptedException {
		// run the process to query bitcoin on dfi corpus
		String cmd = "curl -XGET -G localhost:1021/search -d query=bitcoin -d field=DFI -d numRes=10";
		Process process = Runtime.getRuntime().exec(cmd);
		process.waitFor();
		
		BufferedReader stdInput = new BufferedReader(new 
		     InputStreamReader(process.getInputStream()));

		ArrayList<String> queryResult = new ArrayList<String>();
		String s = "";
		// add every line into the query result
		while ((s = stdInput.readLine()) != null) {
			queryResult.add(s);
		}
		if (queryResult.isEmpty()) {
			System.out.println("DFI query results are empty");
		} else {
			System.out.println("DFI query results:");
			for (int i = 0; i < queryResult.size(); i++) {
				System.out.println(queryResult.get(i));
			}
		}
		assertTrue(queryResult.isEmpty());
	}
	
	/*
	 * nothing should be indexed in the DFI corpus
	 */
	@Test
	public void testEmptyCrawler() throws ParseException, IOException, InterruptedException {
		// run the process to query bitcoin on dfi corpus
		String cmd = "curl -XGET -G localhost:1021/search -d query=bitcoin -d field=DFI -d numRes=10";
		Process process = Runtime.getRuntime().exec(cmd);
		process.waitFor();
		
		BufferedReader stdInput = new BufferedReader(new 
		     InputStreamReader(process.getInputStream()));

		ArrayList<String> queryResult = new ArrayList<String>();
		String s = "";
		// add every line into the query result
		while ((s = stdInput.readLine()) != null) {
			queryResult.add(s);
		}
		if (queryResult.isEmpty()) {
			System.out.println("Crawler query results are empty");
		} else {
			System.out.println("Crawler query results:");
			for (int i = 0; i < queryResult.size(); i++) {
				System.out.println(queryResult.get(i));
			}
		}
		assertTrue(queryResult.isEmpty());
	}
	
	
}
