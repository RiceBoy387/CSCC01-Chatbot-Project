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
 * requires manually indexed first with the command
 * curl -XPOST localhost:1021/update
 * curl -XPOST localhost:1021/search -d field=0 -d docName=depth5.txt
 * assuming that the DFI corpus and depth5.txt file is in the correct location
 */
public class IndexerTest {
	
	/*
	 * test adding the DFI corpus
	 */
	@Test
	public void testDFI() throws IOException, InterruptedException {
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
		
		assertFalse(queryResult.isEmpty());
	}
	
	/*
	 * test adding the crawler corpus
	 */
	@Test
	public void testCrawler() throws IOException, InterruptedException {
		// run the process to query about student life on crawler corpus
		String cmd = "curl -XGET -G localhost:1021/search -d query=student%20life -d field=0 -d numRes=10";
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
		assertFalse(queryResult.isEmpty());

	}
}
