import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

function App() {
  const [data, setData] = useState([]);
  const [index, setIndex] = useState(0);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    axios(
      'https://sheet.best/api/sheets/8d730d45-059a-46bf-aaab-120846acb86d'
    ).then(({ data }) => {
      setData(data);
      const last_checked = data.find((item) => item['Check (ok/no)'] === '');
      const stopped_checking_index = data.indexOf(last_checked);
      setIndex(stopped_checking_index || 0);
    });
  }, []);
  const submitCheckResult = async (result) => {
    if (loading) return;
    setLoading(true);
    try {
      await axios
        .patch(
          `https://sheet.best/api/sheets/8d730d45-059a-46bf-aaab-120846acb86d/${index}`,
          {
            'Check (ok/no)': result,
            'Rejection Reason': rejectReason,
          }
        )
        .then(() => {
          setIndex((p) => p + 1);
          setRejectReason('');
        });
    } finally {
      setLoading(false);
    }
  };
  const renderValue = useMemo(() => {
    if (data?.length) return data[index];
    return {};
  }, [data, index]);
  return (
    <Container $allowReject={rejectReason !== ''}>
      <div>
        <p>{renderValue['Tracking Code']}</p>
        <img
          src={renderValue['Image link']}
          width="500px"
          height="500px"
          alt=""
        />
      </div>
      <div>
        <div className="accepted">
          <button onClick={() => submitCheckResult('Accepted')}>
            Accepted
          </button>
        </div>
        <div className="rejected">
          <input
            onChange={(e) => setRejectReason(e.target.value)}
            value={rejectReason}
          />
          <button onClick={() => submitCheckResult('Rejected')}>
            Rejected
          </button>
        </div>
      </div>
    </Container>
  );
}
const Container = styled.div`
  > div:first-child {
    display: flex;
    align-items: center;
    justify-content: center;
    img {
      object-fit: contain;
      &:hover {
        zoom: 2;
      }
    }
  }
  > div:last-child {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 35px;
    gap: 16px;
    > div {
      display: flex;
      flex-direction: column;
      flex: 1;
      align-items: flex-end;
      min-height: 120px;
      > button,
      > input {
        flex: 1;
        width: 100%;
        border: 1px solid lightgray;
        outline: none;
      }
      > button {
        color: #fff;
        font-size: 25px;
        font-weight: 700;
        letter-spacing: 1px;
      }
    }
    .accepted > button {
      background-color: #14d714;
      cursor: pointer;
    }
    .rejected > button {
      background-color: #e21313;
      cursor: pointer;
      opacity: ${({ $allowReject }) => ($allowReject ? '1' : '0.5')};
      pointer-events: ${({ $allowReject }) => ($allowReject ? 'all' : 'none')};
    }
  }
`;
export default App;
