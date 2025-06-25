import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { UserNavbar } from './Navbar';

const CURRENCIES = [
  { label: 'US Dollar (USD)', value: 'USD', type: 'fiat' },
  { label: 'Euro (EUR)', value: 'EUR', type: 'fiat' },
  { label: 'British Pound (GBP)', value: 'GBP', type: 'fiat' },
  { label: 'Bitcoin (BTC)', value: 'BTC', type: 'crypto' },
  { label: 'Ethereum (ETH)', value: 'ETH', type: 'crypto' },
  { label: 'Tether (USDT)', value: 'USDT', type: 'crypto' },
];

const Deposit = () => {
  // Deposit
  const [depositAmount, setDepositAmount] = useState('');
  const [depositCurrency, setDepositCurrency] = useState('USD');
  const [depositType, setDepositType] = useState('fiat');
  const [depositMsg, setDepositMsg] = useState('');
  const [copyMsg, setCopyMsg] = useState('');
  const [qrDownloadMsg, setQrDownloadMsg] = useState('');
  const [cryptoAddresses, setCryptoAddresses] = useState({
    BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    ETH: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    USDT: 'TQn9Y2khDD95J42FQtQTdwVVR93QZ5Mqoa'
  });
  const [cryptoQRImages, setCryptoQRImages] = useState({
    BTC_QR: null,
    ETH_QR: null,
    USDT_QR: null
  });
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  // Fetch crypto addresses from backend
  useEffect(() => {
    const fetchCryptoAddresses = async () => {
      try {
        const res = await axios.get('/api/user/crypto-addresses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCryptoAddresses(res.data);
        // Set QR code images from backend response
        setCryptoQRImages({
          BTC_QR: res.data.BTC_QR,
          ETH_QR: res.data.ETH_QR,
          USDT_QR: res.data.USDT_QR
        });
      } catch (err) {
        console.error('Failed to fetch crypto addresses:', err);
        // Keep default addresses if fetch fails
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchCryptoAddresses();
  }, [token]);

  // Copy address to clipboard
  const copyToClipboard = async (address) => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(address);
        setCopyMsg('Address copied to clipboard!');
        setTimeout(() => setCopyMsg(''), 3000);
      } else {
        // Fallback for older browsers and mobile devices
        const textArea = document.createElement('textarea');
        textArea.value = address;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
    setCopyMsg('Address copied to clipboard!');
    setTimeout(() => setCopyMsg(''), 3000);
        } catch (err) {
          console.error('Fallback copy failed:', err);
          setCopyMsg('Copy failed. Please select and copy manually.');
          setTimeout(() => setCopyMsg(''), 3000);
        }
        
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error('Copy failed:', err);
      setCopyMsg('Copy failed. Please select and copy manually.');
      setTimeout(() => setCopyMsg(''), 3000);
    }
  };

  // Download QR code as image
  const downloadQRCode = (currency) => {
    if (cryptoQRImages[`${currency}_QR`]) {
      // Download uploaded QR code image
      const link = document.createElement('a');
      link.download = `${currency}-deposit-qr.png`;
      link.href = cryptoQRImages[`${currency}_QR`];
      link.click();
      setQrDownloadMsg(`${currency} QR code downloaded!`);
      setTimeout(() => setQrDownloadMsg(''), 3000);
    } else {
      // Download generated QR code
      const canvas = document.querySelector(`#qr-${currency} canvas`);
      if (canvas) {
        const link = document.createElement('a');
        link.download = `${currency}-deposit-address.png`;
        link.href = canvas.toDataURL();
        link.click();
        setQrDownloadMsg(`${currency} QR code downloaded!`);
        setTimeout(() => setQrDownloadMsg(''), 3000);
      }
    }
  };

  // Deposit handler
  const handleDeposit = async (e) => {
    e.preventDefault();
    setDepositMsg('');
    try {
      const res = await axios.post('/api/transaction/deposit', { amount: depositAmount, currency: depositCurrency, type: depositType }, { headers: { Authorization: `Bearer ${token}` } });
      setDepositMsg(res.data.message || 'Deposit submitted, awaiting approval.');
      setDepositAmount('');
      // Do not update balance immediately
    } catch (err) {
      setDepositMsg(err.response?.data?.message || 'Deposit failed');
    }
  };

  // Check if selected currency is crypto
  const isCryptoCurrency = depositType === 'crypto' && ['BTC', 'ETH', 'USDT'].includes(depositCurrency);

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#ffffff',
      color: '#333333'
    }}>
      <UserNavbar />
      <div className="container py-5">
        {/* Back Arrow */}
        <div className="mb-4">
          <button 
            className="btn d-flex align-items-center gap-2"
            onClick={() => navigate('/dashboard')}
            style={{ 
              backgroundColor: '#d4af37', 
              borderColor: '#d4af37',
              color: '#ffffff',
              borderRadius: '10px',
              padding: '8px 16px',
              fontWeight: '600'
            }}
          >
            <i className="fas fa-chevron-left" style={{ fontSize: '14px' }}></i>
            Back to Dashboard
          </button>
        </div>
        
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-0" style={{ color: '#d4af37', fontWeight: 'bold' }}>
                  Deposit
                </h2>
                <p className="text-muted">Add funds to your investment account</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card border-0 shadow" style={{ 
              backgroundColor: '#ffffff',
              borderRadius: '15px'
            }}>
              <div className="card-body">
                <h5 className="card-title mb-4" style={{ color: '#d4af37', fontWeight: 'bold' }}>
                  <i className="fas fa-wallet me-2"></i>
                  Deposit Funds
                </h5>
                <form className="row g-3" onSubmit={handleDeposit}>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Type</label>
                    <select className="form-select" value={depositType} onChange={e => {
                      const newType = e.target.value;
                      setDepositType(newType);
                      if (newType === 'crypto') {
                        setDepositCurrency('BTC');
                      } else {
                        setDepositCurrency('USD');
                      }
                    }}>
                      <option value="fiat">Fiat</option>
                      <option value="crypto">Crypto</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Currency</label>
                    <select className="form-select" value={depositCurrency} onChange={e => setDepositCurrency(e.target.value)}>
                      {CURRENCIES.filter(c => c.type === depositType).map(c => (
                        <option value={c.value} key={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Crypto Address Display */}
                  {isCryptoCurrency && (
                    <div className="col-12">
                      <label className="form-label fw-bold">
                        <i className="fab fa-bitcoin me-2" style={{ color: '#d4af37' }}></i>
                        {depositCurrency === 'BTC' ? 'BTC Deposit Address:' : 
                         depositCurrency === 'ETH' ? 'ETH Deposit Address:' : 
                         'USDT Deposit Address:'}
                      </label>
                      <div className="row">
                        <div className="col-lg-8 col-md-7">
                          <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
                            <code id={`address-${depositCurrency}`} className="text-break mb-2 mb-md-0">{cryptoAddresses[depositCurrency]}</code>
                        <button 
                          type="button" 
                              className="btn btn-sm"
                              style={{ 
                                backgroundColor: '#d4af37', 
                                borderColor: '#d4af37',
                                color: '#ffffff',
                                borderRadius: '8px',
                                fontWeight: '600'
                              }}
                              onClick={() => copyToClipboard(cryptoAddresses[depositCurrency])}
                        >
                              <i className="fas fa-copy me-1"></i>
                          Copy
                        </button>
                          </div>
                        </div>
                        <div className="col-lg-4 col-md-5 text-center mt-3 mt-md-0">
                          <div className="p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
                            <div id={`qr-${depositCurrency}`}>
                              {cryptoQRImages[`${depositCurrency}_QR`] ? (
                                <img 
                                  src={cryptoQRImages[`${depositCurrency}_QR`]} 
                                  alt={`${depositCurrency} QR Code`} 
                                  style={{ width: '120px', height: '120px' }} 
                                />
                              ) : (
                                <QRCodeSVG 
                                  value={cryptoAddresses[depositCurrency]}
                                  size={120}
                                  level="M"
                                  includeMargin={true}
                                />
                              )}
                            </div>
                            <div className="mt-2">
                              <small className="text-muted">Scan QR Code</small>
                              <br />
                              <button 
                                type="button" 
                                className="btn btn-sm mt-1"
                                style={{ 
                                  backgroundColor: '#6c757d', 
                                  borderColor: '#6c757d',
                                  color: '#ffffff',
                                  borderRadius: '8px',
                                  fontWeight: '600'
                                }}
                                onClick={() => downloadQRCode(depositCurrency)}
                              >
                                <i className="fas fa-download me-1"></i>
                                Download QR
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <small className="text-muted">
                        <i className="fas fa-info-circle me-1"></i>
                        Please make the deposit to the wallet address above. Your balance will be updated after confirmation.
                      </small>
                      {copyMsg && <div className="alert alert-success mt-2" style={{ borderRadius: '10px' }}>{copyMsg}</div>}
                      {qrDownloadMsg && <div className="alert alert-success mt-2" style={{ borderRadius: '10px' }}>{qrDownloadMsg}</div>}
                    </div>
                  )}
                  
                  <div className="col-12">
                    <label className="form-label fw-bold">Amount</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      placeholder="Enter amount" 
                      value={depositAmount} 
                      onChange={e => setDepositAmount(e.target.value)} 
                      min={1} 
                      required 
                      style={{ borderRadius: '8px' }}
                    />
                  </div>
                  <div className="col-12">
                    <button 
                      className="btn w-100" 
                      type="submit"
                      style={{ 
                        backgroundColor: '#d4af37', 
                        borderColor: '#d4af37',
                        color: '#ffffff',
                        borderRadius: '10px',
                        padding: '12px 20px',
                        fontWeight: '600'
                      }}
                    >
                      <i className="fas fa-arrow-up me-2"></i>
                      Submit Deposit
                    </button>
                  </div>
                </form>
                
                {depositMsg && (
                  <div className="alert alert-info mt-3" style={{ borderRadius: '10px' }}>
                    <i className="fas fa-info-circle me-2"></i>
                    {depositMsg}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deposit; 