export default function About() {
  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>About Tickertock</h1>
      
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>What is Tickertock?</h2>
        <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
          Tickertock is a free, easy-to-use platform that provides access to stock and cryptocurrency data. 
          Our goal is to make financial market data accessible to everyone, whether you're a casual investor 
          or a data analyst.
        </p>
        <p style={{ lineHeight: '1.6' }}>
          With Tickertock, you can search for tickers, create customized data tables, and export the data 
          to CSV format for further analysis.
        </p>
      </section>
      
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>How to Use Tickertock</h2>
        <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
          <li style={{ marginBottom: '0.5rem' }}>Search for stock or crypto tickers using the search bar</li>
          <li style={{ marginBottom: '0.5rem' }}>Add desired tickers to your data table</li>
          <li style={{ marginBottom: '0.5rem' }}>Configure which columns to display using the table configuration panel</li>
          <li style={{ marginBottom: '0.5rem' }}>Export your customized data to CSV format with a single click</li>
        </ol>
      </section>
      
      <section>
        <h2 style={{ marginBottom: '1rem' }}>Data Sources</h2>
        <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
          Tickertock uses demonstration data for educational purposes. In a production environment,
          this would be connected to real-time market data APIs.
        </p>
        <p style={{ lineHeight: '1.6' }}>
          For actual investment decisions, please consult reliable financial data sources and consider
          seeking professional financial advice.
        </p>
      </section>
    </div>
  );
} 