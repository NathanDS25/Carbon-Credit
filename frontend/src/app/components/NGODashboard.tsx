import { useState, useEffect } from 'react';
import { Upload, Calendar, MessageCircle, TrendingUp, Leaf, BarChart3, Loader2, Download } from 'lucide-react';
import { verifyAndMintCredits, uploadImage, triggerAction, fetchCompanies } from '../api/carbonApi';
import jsPDF from 'jspdf';
import { TradingDashboard } from './TradingDashboard';
import { ScheduleMeetModal } from './ScheduleMeetModal';
import { SatelliteVerificationPanel } from './SatelliteVerificationPanel';

interface Company {
  id: number;
  name: string;
  creditsNeeded: number;
  industry: string;
  location: string;
}



export function NGODashboard() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [plantedCount, setPlantedCount] = useState<number | null>(null);
  const [creditsAvailable, setCreditsAvailable] = useState<number | null>(null);
  const [activeProjects, setActiveProjects] = useState<number | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'trading'>('overview');
  const [scheduleMeetModal, setScheduleMeetModal] = useState<{ isOpen: boolean; companyName: string }>({
    isOpen: false,
    companyName: '',
  });

  const [landArea, setLandArea] = useState<string>('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<{ ndviScore: number; creditsMinted: number; etherscanLink: string; error?: string } | null>(null);

  useEffect(() => {
    fetchCompanies()
      .then((data: Company[]) => setCompanies(data))
      .catch(() => setCompanies([]))
      .finally(() => setIsLoadingCompanies(false));
  }, []);

  const handleSatelliteAudit = async () => {
    const area = Number(landArea);
    if (isNaN(area) || area <= 0) {
      setAuditResult({ ndviScore: 0, creditsMinted: 0, etherscanLink: '', error: 'Please enter a valid positive number for Land Area.' });
      return;
    }

    setIsAuditing(true);
    setAuditResult(null);

    try {
      const response = await verifyAndMintCredits({
        ngoWallet: '0xDc76DF1Cd30343F9c6C63f0Cbc9D9B4E59Cf6ca7',
        landAreaHectares: area
      });
      setAuditResult({
        ndviScore: response.ndviScore,
        creditsMinted: response.creditsMinted,
        etherscanLink: response.etherscanLink
      });
      // Optionally update the credits available on success
      setCreditsAvailable(prev => prev + response.creditsMinted);
    } catch (err: any) {
      setAuditResult({
        ndviScore: 0,
        creditsMinted: 0,
        etherscanLink: '',
        error: err.error || err.message || 'Failed to connect to the backend server.'
      });
    } finally {
      setIsAuditing(false);
    }
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleActionClick = async (actionType: string, payload: any) => {
    try {
      await triggerAction(actionType, payload);
      // Small visual feedback could go here
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setIsUploading(true);
      try {
        await uploadImage(file);
        alert('Image uploaded successfully to the backend!');
      } catch (err: any) {
        alert('Failed to upload image: ' + err.message);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const generateCertificate = () => {
    if (!auditResult) return;
    const doc = new jsPDF();
    
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('Carbon Credit Certificate', 105, 25, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text('This is to certify that the plantation area has been verified', 20, 60);
    doc.text('and the corresponding carbon credits have been minted on the blockchain.', 20, 70);
    
    doc.setFontSize(12);
    doc.text(`NDVI Score: ${auditResult.ndviScore}`, 20, 100);
    doc.text(`Credits Minted: ${auditResult.creditsMinted}`, 20, 110);
    doc.text(`Transaction Hash:`, 20, 120);
    doc.setFontSize(10);
    doc.setTextColor(16, 185, 129);
    doc.text(auditResult.etherscanLink.split('/').pop() || '', 20, 130);
    
    doc.save('carbon-credit-certificate.pdf');
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-card backdrop-blur-sm rounded-2xl p-2 border border-border shadow-sm inline-flex gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Leaf className="w-4 h-4" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('trading')}
          className={`px-6 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'trading'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Trading
        </button>
      </div>

      {activeTab === 'trading' ? (
        <TradingDashboard />
      ) : (
        <>
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Trees Planted</p>
              <h3 className="mt-1">{plantedCount !== null ? plantedCount.toLocaleString() : '---'}</h3>
            </div>
            <div className="bg-primary/10 p-3 rounded-xl">
              <Leaf className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Credits Available</p>
              <h3 className="mt-1">{creditsAvailable !== null ? creditsAvailable.toLocaleString() : '---'}</h3>
            </div>
            <div className="bg-primary/10 p-3 rounded-xl">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Active Projects</p>
              <h3 className="mt-1">{activeProjects !== null ? activeProjects : '---'}</h3>
            </div>
            <div className="bg-primary/10 p-3 rounded-xl">
              <MessageCircle className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* GEE Satellite Audit Section */}
      <div className="bg-card backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-all duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-primary/10 p-2 rounded-xl">
            <Leaf className="w-5 h-5 text-primary" />
          </div>
          <h3 className="m-0">Satellite Land Audit (Google Earth Engine)</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Verify your plantation using real Sentinel-2 satellite imagery. NDVI &gt; 0.4 required to mint carbon credits.
        </p>
        
        <div className="flex gap-4 items-start mb-4">
          <div className="flex-1">
            <input
              type="number"
              min="0.1"
              step="0.1"
              placeholder="Land Area (Hectares)"
              value={landArea}
              onChange={(e) => setLandArea(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <button
            onClick={handleSatelliteAudit}
            disabled={isAuditing}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[200px]"
          >
            {isAuditing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Scanning Satellite Data...
              </>
            ) : (
              '🛰️ Run Satellite Verification'
            )}
          </button>
        </div>

        {(isAuditing || auditResult) && (
          <div className="mt-2">
            <SatelliteVerificationPanel
              result={auditResult || { ndviScore: 0, creditsMinted: 0, etherscanLink: '' }}
              isVerifying={isAuditing}
              landArea={landArea ? Number(landArea) : undefined}
            />
          </div>
        )}

        {auditResult && !auditResult.error && (
          <button
            onClick={generateCertificate}
            className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF Certificate
          </button>
        )}
      </div>

      {/* Upload Section */}
      <div className="bg-card backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-all duration-300">
        <h3 className="mb-4">Upload Plantation Images</h3>
        <div className={`border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="file-upload"
            disabled={isUploading}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            {isUploading ? (
              <Loader2 className="w-12 h-12 text-primary mx-auto mb-3 animate-spin" />
            ) : (
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            )}
            <p className="text-foreground">{isUploading ? 'Uploading to Server...' : 'Drop images here or click to upload'}</p>
            <p className="text-sm text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
            {selectedImage && !isUploading && (
              <p className="text-sm text-primary mt-2">Selected: {selectedImage.name}</p>
            )}
          </label>
        </div>
      </div>

      {/* Companies Marketplace */}
      <div className="bg-card backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-all duration-300">
        <h3 className="mb-4">Companies Seeking Credits</h3>
        <div className="space-y-3">
          {isLoadingCompanies ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
              <p className="text-muted-foreground">Loading from database...</p>
            </div>
          ) : companies.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">No companies found. Run the seed script to populate the database.</p>
          ) : (
          companies.map((company: any) => (
            <div
              key={company._id}
              className="flex items-center justify-between p-4 bg-accent/50 rounded-xl hover:bg-accent transition-colors"
            >
              <div>
                <h4>{company.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {company.industry} • {company.location}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right mr-4">
                  <p className="text-sm text-muted-foreground">Credits Needed</p>
                  <p className="text-primary">{company.creditsNeeded.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => {
                    setScheduleMeetModal({ isOpen: true, companyName: company.name });
                    handleActionClick('schedule_meet', { companyId: company.id });
                  }}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-all hover:shadow-md flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Schedule Meet
                </button>
                <button 
                  onClick={() => handleActionClick('chat', { companyId: company.id })}
                  className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/80 transition-all hover:shadow-md flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </button>
              </div>
            </div>
          ))
          )}
        </div>
      </div>

      {/* Recent Uploads Gallery */}
      <div className="bg-card backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-all duration-300">
        <h3 className="mb-4">Recent Plantation Images</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square bg-muted rounded-xl overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Leaf className="w-12 h-12 text-primary/40" />
              </div>
            </div>
          ))}
        </div>
      </div>
        </>
      )}

      {/* Schedule Meet Modal */}
      <ScheduleMeetModal
        isOpen={scheduleMeetModal.isOpen}
        onClose={() => setScheduleMeetModal({ isOpen: false, companyName: '' })}
        partnerName={scheduleMeetModal.companyName}
        partnerType="company"
      />
    </div>
  );
}
