import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import Modal from '../components/Modal';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement
);

const LoanDashboard = () => {
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [selectedChart, setSelectedChart] = useState('loansPerMonth');
  const [password, setPassword] = useState('');
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
  const [modalItem, setModalItem] = useState(null);
  const [summaryData, setSummaryData] = useState([
    { id: 'loansPerMonth', label: 'Loans This Month', value: 0 },
    { id: 'loanStatus', label: 'Outstanding Loans', value: 0 }, // Example value
    { id: 'popularItems', label: 'Most Popular Items', value: 0 }, // Example value
  ]);

  // 1st table: Loan transactions
  const [loanData, setLoanData] = useState([]);
  const [loanFilter, setLoanFilter] = useState('');
  const [showAllLoans, setShowAllLoans] = useState(false);
  const [loanSort, setLoanSort] = useState({ key: 'transaction_id', direction: 'descending' });

  // 2nd table: Inventory 
  const [inventoryData, setInventoryData] = useState([]);
  const [showAllInventory, setShowAllInventory] = useState(false);
  const [inventorySort, setInventorySort] = useState({ key: 'item_id', direction: 'descending' });

  // Render summary items
  const renderSummaryItems = () => {
    return summaryData.map((item) => (
      <div
        key={item.id}
        className={`summary-item ${selectedChart === item.id ? 'active' : ''}`}
        onClick={() => setSelectedChart(item.id)}
      >
        <h3>{item.label}</h3>
        <p>{item.value}</p>
      </div>
    ));
  };

  // Conditionally render chart based on selected item
  const renderSelectedChart = () => {
    switch (selectedChart) {
      case 'loansPerMonth':
        return <Bar options={{aspectRatio: 1}} data={loansPerMonthData} />;
      case 'loanStatus':
        return <Pie options={{aspectRatio: 1}} data={loanStatusData} />;
      case 'popularItems':
        return <Bar options={{aspectRatio: 1}} data={mostPopularItemsData} />;
      default:
        return null;
    }
  };

  const filteredLoanData = loanData.filter((transaction) => {
    if (loanFilter.length > 0) {
      return transaction.status === loanFilter;
    }
    return true;
  });

  const handleLoanSort = (key) => {
    let direction = 'ascending';
    if (loanSort.key === key && loanSort.direction === 'ascending') {
      direction = 'descending';
    }
    setLoanSort({ key, direction });

    const sortedData = [...loanData].sort((a, b) => {
      let item1, item2;
      if (!isNaN(a[key]) && !isNaN(b[key])) {
        item1 = parseInt(a[key]);
        item2 = parseInt(b[key]);
      } else {
        item1 = a[key];
        item2 = b[key];
      }
      if (item1 < item2) return direction === 'ascending' ? -1 : 1;
      if (item1 > item2) return direction === 'ascending' ? 1 : -1;
      return 0;
    });
    setLoanData(sortedData);
  };
  
  const handleInventorySort = (key) => {
    let direction = 'ascending';
    if (inventorySort.key === key && inventorySort.direction === 'ascending') {
      direction = 'descending';
    }
    setInventorySort({ key, direction });

    const sortedData = [...inventoryData].sort((a, b) => {
      let item1, item2;
      if (!isNaN(a[key]) && !isNaN(b[key])) {
        item1 = parseInt(a[key]);
        item2 = parseInt(b[key]);
      } else {
        item1 = a[key];
        item2 = b[key];
      }
      if (item1 < item2) return direction === 'ascending' ? -1 : 1;
      if (item1 > item2) return direction === 'ascending' ? 1 : -1;
      return 0;
    });
    setInventoryData(sortedData);
  };

  const getStatusColour = (status) => {
    switch (status) {
      case 'Reserved':
        return 'lightblue';
      case 'Borrowed':
        return 'lightyellow';
      case 'Completed':
        return 'lightgreen';
      case 'Overdue':
        return 'lightred';
      default:
        return 'white';
    }
  };

  useEffect(() => {
    // Fetch loan transactions from the API
    fetch('https://express-server-1.fly.dev/api/loan-transactions')
      .then((response) => response.json())
      .then((data) =>
        setLoanData(data.sort((a, b) => parseInt(b['transaction_id']) - parseInt(a['transaction_id'])))
      )
      .catch((error) => console.error('Error fetching loan transactions:', error));

    fetch('https://express-server-1.fly.dev/api/inventory')
      .then((response) => response.json())
      .then((data) => 
        setInventoryData(data.sort((a, b) => parseInt(b['item_id']) - parseInt(a['item_id'])))
      )
      .catch((error) => console.error('Error fetching inventory:', error));
  }, []);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 200) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  useEffect(() => {
    if (loanData.length === 0) return;
    const date = new Date();
    const mostPopularItem = calculateMostPopularItems()[0];
    setSummaryData([
      { id: 'loansPerMonth', label: 'Loans This Month', value: calculateLoansPerMonth()[date.getMonth()] },
      { id: 'loanStatus', label: 'Outstanding Loans', value: (loanData.length - calculateLoanStatus().Completed).toString() + ' (' + ((loanData.length - calculateLoanStatus().Completed) / loanData.length * 100).toFixed()+'%)' }, // Example value
      { id: 'popularItems', label: 'Most Popular Items', value: mostPopularItem[0] + ' (' + mostPopularItem[1] + ')'}, // Example value
    ]);
  }, [loanData]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Function to calculate loans per month
  const calculateLoansPerMonth = () => {
    const months = Array(12).fill(0); // Array to hold loan counts for each month
    loanData.forEach((transaction) => {
      const startDate = new Date(transaction.start_usage_date);
      const month = startDate.getMonth(); // Get month index (0-11)
      months[month] += 1; // Increment loan count for the respective month
    });
    return months;
  };

  // Function to calculate loan status breakdown
  const calculateLoanStatus = () => {
    const statusCount = {
      Reserved: 0,
      Borrowed: 0,
      Completed: 0,
      Overdue: 0,
    };
    loanData.forEach((transaction) => {
      statusCount[transaction.status] += 1;
    });
    return statusCount;
  };

  // Function to calculate most popular loan items
  const calculateMostPopularItems = () => {
    const itemCount = {};
    loanData.forEach((transaction) => {
      transaction.loan_items.forEach((item) => {
        if (itemCount[item.item_name]) {
          itemCount[item.item_name] += item.quantity;
        } else {
          itemCount[item.item_name] = item.quantity;
        }
      });
    });

    // Convert to array and sort by quantity
    const sortedItems = Object.entries(itemCount).sort((a, b) => b[1] - a[1]);
    return sortedItems.slice(0, 5); // Top 5 popular items
  };

  // Define a helper function to render sort icons
  const getLoanSortIcon = (key) => {
    if (loanSort.key === key) {
      return loanSort.direction === 'ascending' ? '▲' : '▼';
    }
    return '';
  };

  const getInventorySortIcon = (key) => {
    if (inventorySort.key === key) {
      return inventorySort.direction === 'ascending' ? '▲' : '▼';
    }
    return '';
  };

  // Prepare data for charts
  const loansPerMonthData = {
    labels: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    datasets: [
      {
        label: 'Loans per Month',
        data: calculateLoansPerMonth(),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const loanStatusData = {
    labels: ['Reserved', 'Borrowed', 'Completed', 'Overdue'],
    datasets: [
      {
        data: Object.values(calculateLoanStatus()),
        backgroundColor: ['#36A2EB', '#FFCE56', '#FF6384', '#4BC0C0'],
      },
    ],
  };

  const mostPopularItems = calculateMostPopularItems();
  const mostPopularItemsData = {
    labels: mostPopularItems.map((item) => item[0]),
    datasets: [
      {
        label: 'Most Popular Items',
        data: mostPopularItems.map((item) => item[1]),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const correctPassword = '003342'; // Replace with your actual password
    if (password === correctPassword) {
      setIsPasswordCorrect(true);
    }
  };

  return (
    <div className="content-area">
      {!isPasswordCorrect ? (
        <div className="password-form-container">
          <form className="password-form" onSubmit={handlePasswordSubmit}>
            <h2>Hub Dashboard</h2>
            <input
              type="password"
              pattern="[0-9]*" inputmode="numeric"
              autoFocus
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Submit</button>
          </form>
        </div>
      ) : (
        <>
          {/** Modal for selected item **/}
          <Modal isOpen={modalItem} onClose={() => setModalItem(null)}>
            {modalItem && modalItem.item_name && (<>
                <h2>{modalItem.item_name}</h2>
                {modalItem.brand && <p><strong>Brand:</strong> {modalItem.brand}</p>}
                <p><strong>Model:</strong> {modalItem.model || 'N/A'}</p>
                <p><strong>Size/Specs:</strong> {modalItem.size_specs || 'N/A'}</p>
                <p><strong>Requires Approval:</strong> {modalItem.requires_approval === 'true' ? 'Yes' : 'No'}</p>
                {(() => {
                  const imageName = modalItem.item_name ? modalItem.item_name.replace(/\//g, '_').replace(/\s+/g, '_') : 'default';
                  const brandName = modalItem.brand ? modalItem.brand.replace(/\s+/g, '_') : 'default_brand';
                  const imageUrl = modalItem.brand ? `/assets/${imageName}-${brandName}.jpg`.toLowerCase() : `/assets/${imageName}.jpg`.toLowerCase();
                  
                  return <img src={imageUrl} alt={`${modalItem.item_name} view`} className="item-modal-image" />;
                })()}
              </>)
            }
            {modalItem && modalItem.transaction_id && (<>
                <h2>{modalItem.student_name}</h2>
                <p><strong>Status:</strong> {modalItem.status}</p>
                <p><strong>Updated by:</strong> {modalItem.updated_by}</p>
                <hr/>
                <br/>
                <p><strong>Start Date:</strong> {new Date(modalItem.start_usage_date).toLocaleDateString()}</p>
                <p><strong>End Date:</strong> {new Date(modalItem.end_usage_date).toLocaleDateString()}</p>
                <hr/>
                <br/>
                <p><strong>Email:</strong> {modalItem.student_email || 'N/A'}</p>
                <p><strong>Phone:</strong> {modalItem.student_phone || 'N/A'}</p>
                <hr/>
                <h3>Items</h3>
                {modalItem.loan_items.map((item, index) => (
                  <div key={index}>
                    <p>{item.quantity} --- {item.item_name}</p>
                  </div>))}
                {modalItem.loan_items.length===0 && <p>No items. Error?</p>}
                <hr/>
                <h3>Serial Numbers</h3>
                <p style={{whiteSpace:'pre'}}>{modalItem.remarks || 'N/A'}</p>
              </>)
            }
          </Modal>
          {/** Dashboard content **/}
          <br />
          <div className="welcome-message">
            <h1>Hub Staff & Makers Dashboard</h1>
            <p>Loan transactions, inventory and insights.</p>
          </div>

          <div className="dashboard-container">
            <div className="summary-container">{renderSummaryItems()}</div>
            <div className="chart-container">{renderSelectedChart()}</div>
          </div>

          <div className="table-container">
            <h2>Loan Transactions</h2>
            <div className="filter-container">
              <button
                className={`filter-btn ${loanFilter === '' ? 'active' : ''}`}
                onClick={() => setLoanFilter('')}
              >
                Show All {loanData.length}
              </button>
              <button
                className={`filter-btn ${loanFilter === 'Reserved' ? 'active' : ''}`}
                onClick={() => setLoanFilter('Reserved')}
              >
                {loanData.filter((transaction) => {return transaction.status==="Reserved"}).length} Reserved
              </button>
              <button
                className={`filter-btn ${loanFilter === 'Borrowed' ? 'active' : ''}`}
                onClick={() => setLoanFilter('Borrowed')}
              >
                {loanData.filter((transaction) => {return transaction.status==="Borrowed"}).length} Borrowed
              </button>
              <button
                className={`filter-btn ${loanFilter === 'Completed' ? 'active' : ''}`}
                onClick={() => setLoanFilter('Completed')}
              >
                {loanData.filter((transaction) => {return transaction.status==="Completed"}).length} Completed
              </button>
              <button
                className={`filter-btn ${loanFilter === 'Overdue' ? 'active' : ''}`}
                onClick={() => setLoanFilter('Overdue')}
              >
                {loanData.filter((transaction) => {return transaction.status==="Overdue"}).length} Overdue
              </button>
            </div>
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleLoanSort('transaction_id')}>
                    ID {getLoanSortIcon('transaction_id')}
                  </th>
                  <th onClick={() => handleLoanSort('student_name')}>
                    Student Name {getLoanSortIcon('student_name')}
                  </th>
                  <th onClick={() => handleLoanSort('status')}>
                    Status {getLoanSortIcon('status')}
                  </th>
                  <th>Loan Items</th>
                </tr>
              </thead>
              <tbody>
                {filteredLoanData.slice(0,showAllLoans ? -1: 9).map((transaction) => (
                  <tr key={transaction.transaction_id} onClick={()=>setModalItem(transaction)}>
                    <td>{transaction.transaction_id}</td>
                    <td>{transaction.student_name}</td>
                    <td style={{backgroundColor: getStatusColour(transaction.status)}}>{transaction.status}</td>
                    <td>
                      <ul>
                        {transaction.loan_items.map((item, index) => (
                          <li key={index}>
                            {item.item_name} (Qty: {item.quantity})
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <br/>
            {/** Option to show all transactions **/}
            {filteredLoanData.length>10 && 
              <u style={{color:'blue'}} onClick={()=>setShowAllLoans(!showAllLoans)}>
                {showAllLoans? "Only the 10 most recent": "Show "+(filteredLoanData.length-10)+" more ..."}
              </u>}
          </div>

          <br/>
          <br/>

          <div className="table-container">
            <h2>Inventory Data</h2>
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleInventorySort('item_id')}>
                    ID {getInventorySortIcon('item_id')}
                  </th>
                  <th onClick={() => handleInventorySort('item_name')}>
                    Item Name {getInventorySortIcon('item_name')}
                  </th>
                  <th onClick={() => handleInventorySort('total_qty')}>
                    Total Qty {getInventorySortIcon('total_qty')}
                  </th>
                  <th onClick={() => handleInventorySort('qty_available')}>
                    Qty Available {getInventorySortIcon('qty_available')}
                  </th>
                  <th onClick={() => handleInventorySort('qty_reserved')}>
                    Qty Utilized {getInventorySortIcon('qty_reserved')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {inventoryData.slice(0,showAllInventory ? -1: 9).map((item) => (
                  <tr key={item.item_id} onClick={()=>setModalItem(item)}>
                    <td>{item.item_id}</td>
                    <td>{item.item_name}</td>
                    <td>{item.total_qty}</td>
                    <td>{item.qty_available}</td>
                    <td>{item.qty_reserved}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <br/>
            {/** Option to show all inventory **/}
            {inventoryData.length>10 && 
              <u style={{color:'blue'}} onClick={()=>setShowAllInventory(!showAllInventory)}>
                {showAllInventory? "Only the 10 most recent": "Show "+(inventoryData.length-10)+" more ..."}
              </u>}
          </div>

          {showTopBtn && (
            <button className="scrollToTop-btn" onClick={scrollToTop}>
              Back to Top
            </button>
          )}
          <br />
          <br />
        </>
      )}
    </div>
  );
};

export default LoanDashboard;
