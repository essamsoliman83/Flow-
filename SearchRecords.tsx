import { Card } from '@/components/ui/card';
import { InspectionRecord } from '@/types';
import { useInspectionRecords } from '@/hooks/useInspectionRecords';
import { useAuth } from '@/contexts/AuthContext';
import { SearchForm } from '@/components/SearchForm';
import { RecordItem } from '@/components/RecordItem';
import { RecordPreview } from '@/components/RecordPreview';
import { Button } from '@/components/ui/button';
import { FileText, Home, Download, CheckSquare, Square, Table, Paperclip, Trash2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { getInspectorsByWorkplacesFromUsers } from '@/data/inspectors';
import { PREDEFINED_SUPERVISORY_WORKPLACES } from '@/types';
import { ExportModal } from '@/components/ExportModal';
import { useSearchFilters } from '@/hooks/useSearchFilters';
import { useRecordSelection } from '@/hooks/useRecordSelection';
import { useRecordFiltering } from '@/hooks/useRecordFiltering';
import { exportInspectorReportToPDF, exportToExcel, exportToTableFormat } from '@/utils/exportUtils';
import { toast } from 'sonner';
import { 
  hasAttachments, 
  getAttachmentsCount, 
  downloadAllAttachments,
  createAttachmentIndicator 
} from '@/utils/attachmentUtils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useState, useEffect } from 'react';

export const SearchRecords: React.FC = () => {
  const { records, deleteRecord, searchRecords, loading, error } = useInspectionRecords();
  const { currentUser, users } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast: useToastHook } = useToast();
  const [selectedRecord, setSelectedRecord] = useState<InspectionRecord | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<InspectionRecord[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const isMyRecordsView = searchParams.get('view') === 'my-records';

  const {
    filters,
    setFilters,
    updateFilter,
    handleReset,
    getAvailableInspectors,
    getAvailableWorkPlaces
  } = useSearchFilters(currentUser, users, isMyRecordsView);

  // Use search results if available, otherwise use all records
  const recordsToFilter = searchResults.length > 0 ? searchResults : records;
  
  const { filteredRecords } = useRecordFiltering(recordsToFilter, filters, currentUser, isMyRecordsView);

  const {
    selectedRecords,
    toggleRecordSelection,
    toggleSelectAll,
    getSelectedRecordsData
  } = useRecordSelection(filteredRecords);

  // Handle search with API
  const handleSearch = async (searchFilters: any) => {
    setIsSearching(true);
    try {
      const results = await searchRecords(searchFilters);
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
      toast.error('فشل في البحث');
    } finally {
      setIsSearching(false);
    }
  };

  // Reset search results when filters are reset
  const handleResetSearch = () => {
    setSearchResults([]);
    handleReset();
  };

  // دالة محسنة للتعامل مع تحميل المرفقات
  const handleDownloadAttachments = (record: any, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('SearchRecords: Download attachments clicked for record:', record.serialNumber);
    
    if (!record.id) {
      toast.error('معرف المحضر غير صحيح');
      return;
    }
    
    downloadAllAttachments(record.id);
  };

  // دالة محسنة لحذف المحضر مع حذف المرفقات
  const handleDeleteRecord = async (recordId: string, serialNumber: string) => {
    console.log(`Deleting record ${serialNumber} with ID: ${recordId}`);
    
    try {
      // حذف المرفقات المرتبطة بالمحضر
      const attachmentsKey = `attachments_${recordId}`;
      localStorage.removeItem(attachmentsKey);
      console.log(`Deleted attachments for record: ${recordId}`);
      
      // حذف المحضر من قاعدة البيانات
      await deleteRecord(recordId);
      
      // إزالة المحضر من القائمة المحددة
      const newSelectedRecords = new Set(selectedRecords);
      newSelectedRecords.delete(recordId);
      
      // إظهار رسالة نجاح
      toast.success(`تم حذف المحضر ${serialNumber} وجميع مرفقاته نهائياً`);
      
      // Refresh search results if we're in search mode
      if (searchResults.length > 0) {
        setSearchResults(prev => prev.filter(record => record.id !== recordId));
      }
    } catch (err) {
      console.error('Error deleting record:', err);
      toast.error('فشل في حذف المحضر');
    }
  };

  // Show loading state
  if (loading && !isSearching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 font-['Amiri',_'Times_New_Roman',_serif] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">جاري تحميل السجلات...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 font-['Amiri',_'Times_New_Roman',_serif] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600">خطأ: {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  if (selectedRecord) {
    return (
      <RecordPreview
        formData={{
          basicData: selectedRecord.basicData,
          inspectionResults: selectedRecord.inspectionResults,
          recommendations: selectedRecord.recommendations
        }}
        serialNumber={selectedRecord.serialNumber}
        onBack={() => setSelectedRecord(null)}
        onSave={() => {}}
        isViewMode={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 font-['Amiri',_'Times_New_Roman',_serif]">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b-2 border-gray-200 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {isMyRecordsView ? 'محاضري' : 'محاضر المفتشين'}
              </h1>
            </div>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="flex items-center gap-2 hover:bg-blue-50 border-blue-200"
            >
              <Home className="h-4 w-4" />
              العودة للرئيسية
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Form */}
        <SearchForm
          filters={filters}
          onFiltersChange={setFilters}
          onSearch={handleSearch}
          onReset={handleResetSearch}
          availableInspectors={getAvailableInspectors()}
          availableWorkPlaces={getAvailableWorkPlaces()}
          isMyRecordsView={isMyRecordsView}
          isSearching={isSearching}
        />

        {/* Results Summary */}
        <div className="mb-6 text-center">
          <p className="text-lg text-gray-700">
            نتائج البحث ({filteredRecords.length})
            {isSearching && <span className="ml-2 text-blue-600">جاري البحث...</span>}
          </p>
        </div>

        {/* Records List */}
        {filteredRecords.length === 0 ? (
          <Card className="p-8 text-center bg-white/95 backdrop-blur-sm border-2 border-gray-200">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600">لا توجد نتائج للبحث</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <RecordItem
                key={record.id}
                record={record}
                onView={() => setSelectedRecord(record)}
                onDelete={() => handleDeleteRecord(record.id, record.serialNumber)}
                isSelected={selectedRecords.has(record.id)}
                onToggleSelect={() => toggleRecordSelection(record.id)}
                onDownloadAttachments={(e) => handleDownloadAttachments(record, e)}
                showAttachmentIndicator={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

