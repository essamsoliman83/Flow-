import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useInspectionRecords } from '@/hooks/useInspectionRecords';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { FileText } from 'lucide-react';
import { InspectionSections } from '@/components/InspectionSections';
import { BasicDataForm } from '@/components/BasicDataForm';
import { RecordPreview } from '@/components/RecordPreview';
import { RecordHeader } from '@/components/RecordHeader';
import { validateBasicData } from '@/utils/formValidation';

export const CreateRecord: React.FC = () => {
  const { currentUser } = useAuth();
  const { addRecord } = useInspectionRecords();
  
  // Generate shorter serial number
  const [serialNumber] = useState(`INS-${Date.now().toString().slice(-6)}`);
  
  // إعداد التاريخ والوقت التلقائي
  const getCurrentDateTime = () => {
    const now = new Date();
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const day = days[now.getDay()];
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().slice(0, 5);
    
    return { day, date, time };
  };

  const [formData, setFormData] = useState(() => {
    const { day, date, time } = getCurrentDateTime();
    return {
      basicData: {
        day,
        date,
        time,
        inspectorName: currentUser?.name ? [currentUser.name] : [],
        workPlace: currentUser?.workPlace ? [currentUser.workPlace] : [],
        institutionName: '',
        inspectionLocation: '',
        presentPharmacist: '',
        inspectionReason: ''
      },
      inspectionResults: {
        humanResources: [],
        documentsAndBooks: [],
        dispensingPolicies: [],
        storageAndHealth: [],
        inventoryManagement: {
          shortages: [],
          stagnant: [],
          expired: [],
          randomInventory: []
        },
        securityAndSafety: [],
        otherViolations: []
      },
      recommendations: ''
    };
  });

  const [showPreview, setShowPreview] = useState(false);

  // دالة التحقق من صحة البيانات الأساسية
  const validateBasicData = (basicData: any) => {
    const errors = [];

    if (!basicData.day.trim()) {
      errors.push('اليوم');
    }
    if (!basicData.date.trim()) {
      errors.push('التاريخ');
    }
    if (!basicData.time.trim()) {
      errors.push('الوقت');
    }
    if (!Array.isArray(basicData.inspectorName) || basicData.inspectorName.length === 0 || basicData.inspectorName.every(name => !name.trim())) {
      errors.push('اسم المفتش');
    }
    if (!Array.isArray(basicData.workPlace) || basicData.workPlace.length === 0 || basicData.workPlace.every(place => !place.trim())) {
      errors.push('جهة العمل');
    }
    if (!basicData.institutionName.trim()) {
      errors.push('اسم المؤسسة');
    }
    if (!basicData.inspectionLocation.trim()) {
      errors.push('مكان التفتيش');
    }
    if (!basicData.presentPharmacist.trim()) {
      errors.push('اسم الصيدلي المتواجد');
    }
    if (!basicData.inspectionReason.trim()) {
      errors.push('سبب التفتيش');
    }

    return errors;
  };

  const handleBasicDataChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      basicData: {
        ...prev.basicData,
        [field]: value
      }
    }));
  };

  const handleInspectionResultsChange = (inspectionResults: any) => {
    setFormData(prev => ({
      ...prev,
      inspectionResults
    }));
  };

  const handleSave = () => {
    // التحقق من صحة البيانات الأساسية
    const validationErrors = validateBasicData(formData.basicData);
    
    if (validationErrors.length > 0) {
      toast({
        title: "خطأ في البيانات الأساسية",
        description: `يجب ملء الحقول التالية: ${validationErrors.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    try {
      const record = addRecord({
        ...formData,
        createdBy: currentUser?.id || ''
      });
      
      toast({
        title: "تم حفظ المحضر بنجاح",
        description: `رقم المحضر: ${record.serialNumber}`,
      });

      // Reset form with new date/time
      const { day, date, time } = getCurrentDateTime();
      setFormData({
        basicData: {
          day,
          date,
          time,
          inspectorName: currentUser?.name ? [currentUser.name] : [],
          workPlace: currentUser?.workPlace ? [currentUser.workPlace] : [],
          institutionName: '',
          inspectionLocation: '',
          presentPharmacist: '',
          inspectionReason: ''
        },
        inspectionResults: {
          humanResources: [],
          documentsAndBooks: [],
          dispensingPolicies: [],
          storageAndHealth: [],
          inventoryManagement: {
            shortages: [],
            stagnant: [],
            expired: [],
            randomInventory: []
          },
          securityAndSafety: [],
          otherViolations: []
        },
        recommendations: ''
      });
    } catch (error) {
      toast({
        title: "خطأ في حفظ المحضر",
        description: "حدث خطأ أثناء حفظ البيانات",
        variant: "destructive",
      });
    }
  };

  const handlePreview = () => {
    // التحقق من صحة البيانات الأساسية قبل المعاينة أيضاً
    const validationErrors = validateBasicData(formData.basicData);
    
    if (validationErrors.length > 0) {
      toast({
        title: "خطأ في البيانات الأساسية",
        description: `يجب ملء الحقول التالية قبل المعاينة: ${validationErrors.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    setShowPreview(true);
  };

  if (showPreview) {
    return (
      <RecordPreview
        formData={formData}
        serialNumber={serialNumber}
        onBack={() => setShowPreview(false)}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 font-['Amiri',_'Times_New_Roman',_serif]">
      <RecordHeader onPreview={handlePreview} onSave={handleSave} />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
        <Card className="bg-white/95 backdrop-blur-sm border-2 border-gray-200 shadow-2xl hover:shadow-3xl transition-shadow">
          <CardHeader className="pb-4 sm:pb-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
            <CardTitle className="text-lg sm:text-xl md:text-2xl text-right flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-blue-600" />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">رقم المحضر: {serialNumber}</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 sm:space-y-10 p-4 sm:p-6 md:p-8">
            {/* البيانات الأساسية */}
            <BasicDataForm
              formData={formData}
              onBasicDataChange={handleBasicDataChange}
            />

            {/* نتائج التفتيش */}
            <div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-6 sm:mb-8 text-right border-b-2 border-blue-200 pb-3 sm:pb-4">نتائج التفتيش</h3>
              <InspectionSections
                data={formData.inspectionResults}
                onChange={handleInspectionResultsChange}
              />
            </div>

            {/* التوصيات */}
            <div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 text-right border-b-2 border-blue-200 pb-3 sm:pb-4">التوصيات</h3>
              <Textarea
                value={formData.recommendations}
                onChange={(e) => setFormData(prev => ({ ...prev, recommendations: e.target.value }))}
                className="text-right min-h-[120px] sm:min-h-[150px] border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-base sm:text-lg p-3 sm:p-4 shadow-sm"
                placeholder="اكتب التوصيات هنا..."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
