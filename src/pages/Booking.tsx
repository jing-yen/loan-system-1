import React from 'react';

const OutlookBooking: React.FC<{}> = () => {
  const containerStyle: React.CSSProperties = { height: '100vh', width: '100%', overflow: 'hidden' };
  const iframeStyle: React.CSSProperties = { width: '100%', height: '100%', border: 'none' };

  return (
    <div style={containerStyle}>
      <iframe
        src="https://outlook.office365.com/book/InnovationDesignHubMediaRoom@nusu.onmicrosoft.com"
        title="Innovation Design Hub Media Room Booking"
        style={iframeStyle}
        allowFullScreen
      />
    </div>
  );
};

export default OutlookBooking;