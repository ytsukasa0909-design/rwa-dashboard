import React from 'react';

const IndonesiaNonBankData = ({ data }) => {
  if (!data || data.length === 0) {
    return <div>データなし</div>;
  }

  return (
    <div>
      <h2>インドネシアのノンバンクデータ</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default IndonesiaNonBankData;

