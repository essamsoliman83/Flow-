import { useState, useEffect } from 'react';
import { InspectionRecord } from '@/types';
import { api } from '@/lib/api';

export const useInspectionRecords = () => {
  const [records, setRecords] = useState<InspectionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load records from API
  const loadRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getRecords();
      setRecords(response.records || []);
    } catch (err) {
      setError('فشل في تحميل السجلات');
      console.error('Error loading records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const addRecord = async (record: any) => {
    setLoading(true);
    setError(null);
    try {
      // Prepare data for API
      const recordData = {
        day: record.basicData.day,
        date: record.basicData.date,
        time: record.basicData.time,
        institution_name: record.basicData.institutionName,
        location: record.basicData.inspectionLocation,
        pharmacist_name: record.basicData.presentPharmacist,
        inspection_reason: record.basicData.inspectionReason,
        inspector_name: Array.isArray(record.basicData.inspectorName) 
          ? record.basicData.inspectorName.join(', ') 
          : record.basicData.inspectorName,
        work_entities: Array.isArray(record.basicData.workPlace) 
          ? record.basicData.workPlace 
          : [record.basicData.workPlace],
        inspection_results: record.inspectionResults,
        recommendations: record.recommendations,
        created_by: record.createdBy || 'admin'
      };

      const newRecord = await api.createRecord(recordData);
      
      // Reload records to get updated list
      await loadRecords();
      
      return newRecord;
    } catch (err) {
      setError('فشل في حفظ السجل');
      console.error('Error creating record:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRecord = async (id: string, updates: Partial<InspectionRecord>) => {
    setLoading(true);
    setError(null);
    try {
      await api.updateRecord(id, updates);
      await loadRecords();
    } catch (err) {
      setError('فشل في تحديث السجل');
      console.error('Error updating record:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.deleteRecord(id);
      await loadRecords();
    } catch (err) {
      setError('فشل في حذف السجل');
      console.error('Error deleting record:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert to array if needed
  const toArray = (value: string | string[]): string[] => {
    return Array.isArray(value) ? value : [value];
  };

  // Helper function to convert to string for display
  const toString = (value: string | string[]): string => {
    return Array.isArray(value) ? value.join(', ') : value;
  };

  // Search records using API
  const searchRecords = async (filters: any) => {
    setLoading(true);
    setError(null);
    try {
      const searchParams: any = {};
      
      if (filters.institutionName) {
        searchParams.institution_name = filters.institutionName;
      }
      if (filters.inspectionLocation) {
        searchParams.location = filters.inspectionLocation;
      }
      if (filters.presentPharmacist) {
        searchParams.pharmacist_name = filters.presentPharmacist;
      }
      if (filters.dateFrom) {
        searchParams.date_from = filters.dateFrom;
      }
      if (filters.dateTo) {
        searchParams.date_to = filters.dateTo;
      }
      if (filters.violationText) {
        searchParams.violations_text = filters.violationText;
      }
      if (filters.workPlace) {
        searchParams.work_entities = filters.workPlace;
      }

      const response = await api.searchRecords(searchParams);
      return response.records || [];
    } catch (err) {
      setError('فشل في البحث');
      console.error('Error searching records:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // دالة لتحليل أسماء المفتشين المتعددة
  const parseInspectorNames = (inspectorName: string | string[]): string[] => {
    if (Array.isArray(inspectorName)) {
      return inspectorName.filter(name => name.trim().length > 0);
    }
    
    if (!inspectorName.trim()) return [];
    
    // تقسيم الأسماء باستخدام - أو /
    const names = inspectorName.split(/[-\/]/).map(name => name.trim()).filter(name => name.length > 0);
    return names;
  };

  // دالة للتحقق من تطابق أسماء المفتشين
  const matchesInspectorNames = (recordInspectorName: string | string[], searchInspectorName: string): boolean => {
    if (!searchInspectorName.trim()) return true;
    
    const recordNames = parseInspectorNames(recordInspectorName);
    const searchNames = parseInspectorNames(searchInspectorName);
    
    // التحقق من وجود أي من أسماء البحث في أسماء المحضر
    return searchNames.some(searchName => 
      recordNames.some(recordName => 
        recordName.toLowerCase().includes(searchName.toLowerCase())
      )
    );
  };

  // دالة للتحقق من تطابق أسماء المفتشين مع القائمة المتعددة - محسنة للبحث الدقيق
  const matchesSelectedInspectors = (recordInspectorName: string | string[], selectedInspectors: string[]): boolean => {
    if (!selectedInspectors.length) return true;
    
    // التحقق من وجود خيار "الكل"
    if (selectedInspectors.includes('الكل')) return true;
    
    const recordNames = parseInspectorNames(recordInspectorName);
    
    // التحقق من وجود أي من المفتشين المحددين في أسماء المحضر - بحث دقيق
    return selectedInspectors.some(selectedInspector => 
      recordNames.some(recordName => 
        recordName.toLowerCase().includes(selectedInspector.toLowerCase()) ||
        selectedInspector.toLowerCase().includes(recordName.toLowerCase())
      )
    );
  };

  // دالة للتحقق من تطابق جهات العمل
  const matchesWorkPlace = (recordWorkPlace: string | string[], searchWorkPlace: string): boolean => {
    if (!searchWorkPlace.trim()) return true;
    
    const workPlaces = toArray(recordWorkPlace);
    return workPlaces.some(workPlace => 
      workPlace.toLowerCase().includes(searchWorkPlace.toLowerCase())
    );
  };

  // دالة للتحقق من تطابق جهات العمل مع القائمة المتعددة
  const matchesSelectedWorkPlaces = (recordWorkPlace: string | string[], selectedWorkPlaces: string[]): boolean => {
    if (!selectedWorkPlaces.length) return true;
    
    const recordWorkPlaces = toArray(recordWorkPlace);
    
    // التحقق من وجود أي من جهات العمل المحددة في جهات عمل المحضر
    return selectedWorkPlaces.some(selectedWorkPlace => 
      recordWorkPlaces.some(recordWP => 
        recordWP.toLowerCase().includes(selectedWorkPlace.toLowerCase())
      )
    );
  };

  // دالة البحث في المخالفات
  const matchesViolationText = (record: InspectionRecord, searchText: string): boolean => {
    if (!searchText.trim()) return true;
    
    const lowerSearchText = searchText.toLowerCase();
    
    // البحث في جميع أقسام المخالفات
    if (record.inspectionResults) {
      for (const section in record.inspectionResults) {
        const violations = record.inspectionResults[section];
        if (Array.isArray(violations)) {
          const found = violations.some(violation => 
            violation.toLowerCase().includes(lowerSearchText)
          );
          if (found) return true;
        }
      }
    }
    
    return false;
  };

  // دالة البحث في إدارة المخزون
  const matchesInventoryType = (record: InspectionRecord, inventoryType: string): boolean => {
    if (!inventoryType.trim()) return true;
    
    const lowerInventoryType = inventoryType.toLowerCase();
    
    // البحث في قسم إدارة المخزون
    if (record.inspectionResults && record.inspectionResults.inventoryManagement) {
      const violations = record.inspectionResults.inventoryManagement;
      if (Array.isArray(violations)) {
        return violations.some(violation => 
          violation.toLowerCase().includes(lowerInventoryType)
        );
      }
    }
    
    return false;
  };

  // دالة تحقق من وجود اسم المفتش في المحضر - للاستخدام في قسم "محاضري"
  const isMyRecord = (record: InspectionRecord, userName: string): boolean => {
    if (!userName.trim()) return false;
    
    const inspectorNames = toString(record.basicData.inspectorName);
    return inspectorNames.toLowerCase().includes(userName.toLowerCase());
  };

  return {
    records,
    loading,
    error,
    addRecord,
    updateRecord,
    deleteRecord,
    searchRecords,
    loadRecords,
    // Helper functions for components that need to handle both formats
    toArray,
    toString,
    matchesSelectedInspectors,
    matchesSelectedWorkPlaces,
    matchesViolationText,
    matchesInventoryType,
    // New function for "My Records" filtering
    isMyRecord
  };
};

