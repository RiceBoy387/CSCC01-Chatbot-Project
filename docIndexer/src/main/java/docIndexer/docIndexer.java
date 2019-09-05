package docIndexer;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field;
import org.apache.lucene.document.StringField;
import org.apache.lucene.document.TextField;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.index.IndexReader;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.index.Term;
import org.apache.lucene.queryparser.classic.ParseException;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.PhraseQuery;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.ScoreDoc;
import org.apache.lucene.search.TopDocs;
import org.apache.lucene.search.TopScoreDocCollector;
import org.apache.lucene.search.WildcardQuery;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.RAMDirectory;

public class docIndexer {
	
	private Analyzer analyzer = null;
	private Directory index = null;
	private IndexWriterConfig config = null;
	private static IndexWriter w;
    
    // index a specified field to text
    public void indexDoc(String field, String text) throws IOException {
    	// create a new document to add to index
    	Document doc = new Document();
    	doc.add(new TextField(field, text.trim(), Field.Store.YES));
    	w.addDocument(doc);
    	w.commit();
    }

    /*
     * initialize the indexer
     * using default specifications
     * if interested, can change with respect to the user's needs
     * such as using a different indexer, location of index, etc
     */
    public docIndexer() throws IOException {
	    this.analyzer = new StandardAnalyzer();
	    this.index = new RAMDirectory();
	    this.config = new IndexWriterConfig(analyzer);
	    w = new IndexWriter(this.index, this.config);
	    w.commit();
	}
	
	/*
	 * query for any specified field
	 */
	public ArrayList<String> queryFields(String field, String querystr
			, int hitsPerPage) throws ParseException, IOException {
		// storage of the results found with respect to the query
		ArrayList<String> result = new ArrayList<String>();
		// parse the query
		Query q = new QueryParser(field, this.analyzer).parse(querystr);
		// query the documents in the index
	    IndexReader reader = DirectoryReader.open(index);
	    IndexSearcher searcher = new IndexSearcher(reader);
	    TopScoreDocCollector collector = TopScoreDocCollector.
	    		create(hitsPerPage);
	    searcher.search(q, collector);
	    ScoreDoc[] hits = collector.topDocs().scoreDocs;
	    // get the best matching outputs with respect to
	    // the number of hits specified
	    for(int i=0;i<hits.length;++i) {
	    	int docId = hits[i].doc;
	    	Document d = searcher.doc(docId);
	    	result.add(d.get(field));
	    }
	    reader.close();
	    return result;
	}
	
	/*
	 * query for any specified field allowing wildcards
	 */
	public ArrayList<String> wildcardQuery(String field, String querystr,
			int hitsPerPage) throws ParseException, IOException {
		// storage of the results found with respect to the query
		ArrayList<String> result = new ArrayList<String>();
		// parse the query as a term
		Term term = new Term(field, querystr);
		Query q = new WildcardQuery(term);
		// query the documents in the index
	    IndexReader reader = DirectoryReader.open(index);
	    IndexSearcher searcher = new IndexSearcher(reader);
	    TopScoreDocCollector collector = TopScoreDocCollector.
	    		create(hitsPerPage);
	    searcher.search(q, collector);
	    // get the best matching outputs with respect to
	    // the number of hits specified
	    ScoreDoc[] hits = collector.topDocs().scoreDocs;
	    for(int i=0;i<hits.length;++i) {
	    	int docId = hits[i].doc;
	    	Document d = searcher.doc(docId);
	    	result.add(d.get(field));
	    }

	    reader.close();
	    return result;
	}
	
	/*
	 * flush the document of any matching querystr
	 */
	public void deleteDoc(String field, String querystr)
			throws IOException {
		// create the term for the queries to delete from the field
		Term term = new Term(field, querystr);
		Query q = new WildcardQuery(term);
		// delete all matching queries
	    w.deleteDocuments(q);
	    w.commit();
	}

}















