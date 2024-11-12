import React from 'react';

const PowerBIEmbed = () => {
  return (
    <div className="h-screen w-full">
      <iframe 
        title="Health Metrics Report"
        width="100%" 
        height="100%" 
        src="https://app.powerbi.com/groups/ea408c36-c986-40b1-b6ad-72ee226472c6/reports/3a5d4b77-ce06-4735-b668-106ea6cfa513/56930b3e4895c7e0b36b?experience=power-bi"
        frameBorder="0" 
        allowFullScreen={true}
      ></iframe>
    </div>
  );
};

export default PowerBIEmbed;