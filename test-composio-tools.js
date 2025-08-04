// Simple test script to verify the Composio tools work correctly
const { composioSearch } = require('./lib/ai/tools/composio-search.ts');
const { textToPdf } = require('./lib/ai/tools/text-to-pdf.ts');

async function testComposioSearch() {
  console.log('Testing Composio Search...');
  try {
    const result = await composioSearch.execute({
      query: 'artificial intelligence',
      maxResults: 5,
      includeContent: true
    });
    console.log('Search Result:', JSON.stringify(result, null, 2));
    return result.totalResults > 0;
  } catch (error) {
    console.error('Search test failed:', error);
    return false;
  }
}

async function testTextToPdf() {
  console.log('Testing Text to PDF...');
  try {
    const result = await textToPdf.execute({
      text: 'This is a test document that will be converted to PDF format.',
      title: 'Test Document',
      fontSize: 12,
      pageSize: 'A4'
    });
    console.log('PDF Result:', JSON.stringify(result, null, 2));
    return result.success === true;
  } catch (error) {
    console.error('PDF test failed:', error);
    return false;
  }
}

async function runTests() {
  console.log('Running Composio Tools Tests...\n');
  
  const searchTest = await testComposioSearch();
  console.log('Search test:', searchTest ? 'PASSED' : 'FAILED');
  
  const pdfTest = await testTextToPdf();
  console.log('PDF test:', pdfTest ? 'PASSED' : 'FAILED');
  
  console.log('\nTest Summary:');
  console.log('- Search Tool:', searchTest ? '✓' : '✗');
  console.log('- PDF Tool:', pdfTest ? '✓' : '✗');
  
  if (searchTest && pdfTest) {
    console.log('\n🎉 All tests passed! The Composio tools are working correctly.');
  } else {
    console.log('\n❌ Some tests failed. Please check the implementation.');
  }
}

runTests().catch(console.error);