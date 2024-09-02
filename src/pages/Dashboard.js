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
    const [inventoryData, setInventoryData] = useState([]);
    const [loanTransactions, setLoanTransactions] = useState([]);
    const [showTopBtn, setShowTopBtn] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'transaction_id', direction: 'descending' });
    const [filter, setFilter] = useState('All');
    const [selectedChart, setSelectedChart] = useState('loansPerMonth');

    // Example summary data for the top section
    const summaryData = [
        { id: 'loansPerMonth', label: 'Loans Per Month', value: loanTransactions.length },
        { id: 'loanStatus', label: 'Loan Status Breakdown', value: 100 }, // Example value
        { id: 'popularItems', label: 'Most Popular Items', value: 50 }, // Example value
    ];

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
            return <Bar data={loansPerMonthData} />;
            case 'loanStatus':
            return <Pie data={loanStatusData} />;
            case 'popularItems':
            return <Bar data={mostPopularItemsData} />;
            default:
            return null;
        }
    };

    const filteredTransactions = loanTransactions.filter(transaction => {
        if (filter === 'Overdue') {
            return transaction.status === 'Overdue';
        }
        return true;
    });

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });

        const sortedData = [...loanTransactions].sort((a, b) => {
            if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
            if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
            return 0;
        });
        setLoanTransactions(sortedData);
    };

  useEffect(() => {
    // Fetch loan transactions from the API
    fetch('http://localhost:5000/api/loan-transactions')
      .then(response => response.json())
      .then(data => setLoanTransactions(data.sort((a,b)=>{return b['transaction_id']-a['transaction_id']})))
      .catch(error => console.error('Error fetching loan transactions:', error));
      
    fetch('http://localhost:5000/api/inventory')
        .then(response => response.json())
        .then(data => setInventoryData(data))
        .catch(error => console.error('Error fetching inventory:', error));
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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Function to calculate loans per month
  const calculateLoansPerMonth = () => {
    const months = Array(12).fill(0); // Array to hold loan counts for each month
    loanTransactions.forEach(transaction => {
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
    loanTransactions.forEach(transaction => {
      statusCount[transaction.status] += 1;
    });
    return statusCount;
  };

  // Function to calculate most popular loan items
  const calculateMostPopularItems = () => {
    const itemCount = {};
    loanTransactions.forEach(transaction => {
      transaction.loan_items.forEach(item => {
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
    const getSortIcon = (key) => {
        if (sortConfig.key === key) {
        return sortConfig.direction === 'ascending' ? '▲' : '▼';
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
    labels: mostPopularItems.map(item => item[0]),
    datasets: [
      {
        label: 'Most Popular Items',
        data: mostPopularItems.map(item => item[1]),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  return (
    <div className="content-area">
        <br/>
        <div className="welcome-message">
            <h1>Loan Transactions Dashboard</h1>
            <p>View and manage all loan transactions.</p>
        </div>

        <div className="dashboard-container">
            <div className="summary-container">
                {renderSummaryItems()}
            </div>
            <div className="chart-container">
                {renderSelectedChart()}
            </div>
        </div>

        <div className="table-container">
            <h2>Loan Transactions</h2>
            <div className="filter-container">
                <button className={`filter-btn ${filter === 'All' ? 'active' : ''}`} onClick={() => setFilter('All')}>Show All</button>
                <button className={`filter-btn ${filter === 'Overdue' ? 'active' : ''}`} onClick={() => setFilter('Overdue')}>Show Overdue</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th onClick={() => handleSort('transaction_id')}>Transaction ID {getSortIcon('transaction_id')}</th>
                        <th onClick={() => handleSort('student_name')}>Student Name {getSortIcon('student_name')}</th>
                        <th onClick={() => handleSort('student_email')}>Email {getSortIcon('student_email')}</th>
                        <th onClick={() => handleSort('student_phone')}>Phone {getSortIcon('student_phone')}</th>
                        <th onClick={() => handleSort('start_usage_date')}>Start Date {getSortIcon('start_usage_date')}</th>
                        <th onClick={() => handleSort('end_usage_date')}>End Date {getSortIcon('end_usage_date')}</th>
                        <th onClick={() => handleSort('status')}>Status {getSortIcon('status')}</th>
                        <th>Loan Items</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTransactions.map(transaction => (
                        <tr key={transaction.transaction_id}>
                            <td>{transaction.transaction_id}</td>
                            <td>{transaction.student_name}</td>
                            <td>{transaction.student_email}</td>
                            <td>{transaction.student_phone}</td>
                            <td>{new Date(transaction.start_usage_date).toLocaleDateString()}</td>
                            <td>{new Date(transaction.end_usage_date).toLocaleDateString()}</td>
                            <td>{transaction.status}</td>
                            <td>
                                <ul>
                                    {transaction.loan_items.map((item, index) => (
                                        <li key={index}>{item.item_name} (Qty: {item.quantity})</li>
                                    ))}
                                </ul>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <div className='table-container'>
        <h2>All Inventory</h2>
      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort("item_id")}>
              Item ID {getSortIcon("item_id")}
            </th>
            <th onClick={() => handleSort("item_name")}>
              Item Name {getSortIcon("item_name")}
            </th>
            <th onClick={() => handleSort("total_qty")}>
              Total Quantity {getSortIcon("total_qty")}
            </th>
            <th onClick={() => handleSort("qty_available")}>
              Quantity Available {getSortIcon("qty_available")}
            </th>
            <th onClick={() => handleSort("qty_reserved")}>
              Quantity Reserved {getSortIcon("qty_reserved")}
            </th>
            <th onClick={() => handleSort("qty_borrowed")}>
              Quantity Borrowed {getSortIcon("qty_borrowed")}
            </th>
            <th onClick={() => handleSort("loanable")}>
              Loanable {getSortIcon("loanable")}
            </th>
            <th onClick={() => handleSort("requires_approval")}>
              Requires Approval {getSortIcon("requires_approval")}
            </th>
            <th onClick={() => handleSort("brand")}>
              Brand {getSortIcon("brand")}
            </th>
            <th onClick={() => handleSort("category")}>
              Category {getSortIcon("category")}
            </th>
            <th onClick={() => handleSort("size_specs")}>
              Size/Specs {getSortIcon("size_specs")}
            </th>
            <th onClick={() => handleSort("model")}>
              Model {getSortIcon("model")}
            </th>
          </tr>
        </thead>
        <tbody>
          {inventoryData.map((item) => (
            <tr key={item.item_id}>
              <td>{item.item_id}</td>
              <td>{item.item_name}</td>
              <td>{item.total_qty}</td>
              <td>{item.qty_available}</td>
              <td>{item.qty_reserved}</td>
              <td>{item.qty_borrowed}</td>
              <td>{item.loanable ? "Yes" : "No"}</td>
              <td>{item.requires_approval ? "Yes" : "No"}</td>
              <td>{item.brand}</td>
              <td>{item.category}</td>
              <td>{item.size_specs}</td>
              <td>{item.model}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

        {showTopBtn && (
            <button className="scrollToTop-btn" onClick={scrollToTop}>
                Back to Top
            </button>
        )}
        <br/><br/>
    </div>
);

};

export default LoanDashboard;
