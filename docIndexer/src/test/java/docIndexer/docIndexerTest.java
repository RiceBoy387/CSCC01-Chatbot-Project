package docIndexer;

import org.apache.lucene.document.Document;

import org.junit.Test;
import static org.junit.Assert.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.apache.lucene.queryparser.classic.ParseException;
import org.junit.Before;

public class docIndexerTest {
	
	private docIndexer docIndex;
	
	// setup before the run of every test
	@Before
	public void setup() throws IOException {
		docIndex = new docIndexer();
	}
	
	public void writeSample() throws IOException {
		docIndex.indexDoc("kaku", "Parallel worlds : a journey through creation, higher dimensions, and the future of the cosmos");
		docIndex.indexDoc("kaku", "Physics of the impossible : a scientific exploration into the world of phasers, force fields, teleportation, and time travel");
		docIndex.indexDoc("kaku", "Physics of the future : how science will shape human destiny and our daily lives by the year 2100");
		docIndex.indexDoc("kaku", "Visions : how science will revolutionize the 21st century");
		docIndex.indexDoc("kaku", "Hyperspace : a scientific odyssey through parallel universes, time warps, and the tenth dimension");
		docIndex.indexDoc("kaku", "The future of humanity : terraforming Mars, interstellar travel, immortality, and our destiny beyond Earth");
		docIndex.indexDoc("kaku", "Einstein's cosmos : how Albert Einstein's vision transformed our understanding of space and time");
		docIndex.indexDoc("kaku", "The future of the mind : the scientific quest to understand, enhance, and empower the mind");
	}
	
	// nothing should be indexed
	@Test
	public void testEmpty() throws ParseException, IOException {
		ArrayList<String> result = docIndex.queryFields("kaku", "Gigabytes", 10);
		assertTrue(result.isEmpty());
	}
	
	// after adding the specified titles, search is not case sensitive
	@Test
	public void testSampleCAPITAL() throws IOException, ParseException {
		writeSample();
		
		ArrayList<String> result = docIndex.queryFields("kaku", "VISIONS", 10);
		assertFalse(result.isEmpty());
	}

	// fields are case sensitives
	@Test
	public void testSimpleIndexDocCAPITALfield() throws IOException, ParseException {
		docIndex.indexDoc("hue", "euheuheuh");
		
		ArrayList<String> result = docIndex.queryFields("HUE", "euheuheuh", 10);
		assertFalse(result.size() == 1);
	}
	
	// test the boundary of 2 for cases where there are <, ==, >
	// as well as confirming the case sensitivity test
	@Test
	public void testIndexDoc() throws IOException, ParseException {
		writeSample();
		
		ArrayList<String> result = docIndex.queryFields("kaku", "Parallel", 10);
		assertTrue(result.size() == 2);
		
		result = docIndex.queryFields("kaku", "ScIeNTifIc", 10);
		assertTrue(result.size() > 2);
		
		result = docIndex.queryFields("kaku", "huehuehue", 10);
		assertTrue(result.size() < 2);
	}
	
	// test the search of a wildcard
	@Test
	public void testWildcard() throws IOException, ParseException {
		writeSample();
		
		// should return all titles
		ArrayList<String> result = docIndex.wildcardQuery("kaku", "*", 10);
		assertTrue(result.size() == 8);
	}
	
	// test for flushing a field
	@Test
	public void testFlush() throws IOException, ParseException {
		writeSample();
		
		// before deleting, all titles should be returned
		ArrayList<String> result = docIndex.wildcardQuery("kaku", "*", 10);
		assertTrue(result.size() == 8);
		
		// after flushing, no titles should be returned
		docIndex.deleteDoc("kaku", "*");
		result = docIndex.wildcardQuery("kaku", "*", 10);
		assertTrue(result.size() == 0);

	}

	
}
