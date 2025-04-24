function Graph() {
    return (
      <div className="graph">
        {/* In a real application, you would use a charting library like Chart.js or Recharts */}
        <img 
          src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNIDUwLDM1MCBRIDIwMCwyMDAgNDAwLDMwMCBUIDc1MCw1MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMzQ5OGRiIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=" 
          alt="Account Overview Graph"
          style={{ width: '100%', height: '300px', objectFit: 'cover' }}
        />
      </div>
    );
  }
  
  export default Graph;