import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RotateCcw, Calendar, User, Building2, AlertTriangle, MapPin, Search } from 'lucide-react';
import { MultiSelect } from '@/components/MultiSelect';
import { InventorySelect } from '@/components/InventorySelect';

interface SearchFormProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
  onSearch: (filters: any) => void;
  onReset: () => void;
  availableInspectors?: string[];
  availableWorkPlaces?: string[];
  isMyRecordsView?: boolean;
  isSearching?: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  onReset,
  availableInspectors = [],
  availableWorkPlaces = [],
  isMyRecordsView = false,
  isSearching = false
}) => {
  
  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const handleSearchClick = () => {
    // Prepare search parameters for API
    const searchParams: any = {};
    
    if (filters.institutionName?.trim()) {
      searchParams.institutionName = filters.institutionName.trim();
    }
    if (filters.inspectionLocation?.trim()) {
      searchParams.inspectionLocation = filters.inspectionLocation.trim();
    }
    if (filters.presentPharmacist?.trim()) {
      searchParams.presentPharmacist = filters.presentPharmacist.trim();
    }
    if (filters.dateFrom) {
      searchParams.dateFrom = filters.dateFrom;
    }
    if (filters.dateTo) {
      searchParams.dateTo = filters.dateTo;
    }
    if (filters.violationText?.trim()) {
      searchParams.violationText = filters.violationText.trim();
    }
    if (filters.workPlace?.trim()) {
      searchParams.workPlace = filters.workPlace.trim();
    }

    onSearch(searchParams);
  };
  
  return (
    <Card className="mb-6 bg-white/95 backdrop-blur-sm border-2 border-gray-200">
      <CardHeader>
        <CardTitle className="text-xl text-right">فلاتر البحث</CardTitle>
        <p className="text-sm text-gray-600 text-right">ابحث في محاضر التفتيش باستخدام معايير مختلفة</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* حقل التاريخ من */}
          <div className="space-y-2">
            <Label className="text-right flex items-center justify-end">
              <span className="mr-2">من تاريخ</span>
              <Calendar className="h-4 w-4" />
            </Label>
            <Input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="text-right"
            />
          </div>

          {/* حقل التاريخ إلى */}
          <div className="space-y-2">
            <Label className="text-right flex items-center justify-end">
              <span className="mr-2">إلى تاريخ</span>
              <Calendar className="h-4 w-4" />
            </Label>
            <Input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="text-right"
            />
          </div>

          {/* اسم المؤسسة */}
          <div className="space-y-2">
            <Label className="text-right flex items-center justify-end">
              <span className="mr-2">اسم المؤسسة</span>
              <Building2 className="h-4 w-4" />
            </Label>
            <Input
              placeholder="ابحث باسم المؤسسة"
              value={filters.institutionName || ''}
              onChange={(e) => handleFilterChange('institutionName', e.target.value)}
              className="text-right"
            />
          </div>

          {/* مكان التفتيش */}
          <div className="space-y-2">
            <Label className="text-right flex items-center justify-end">
              <span className="mr-2">مكان التفتيش</span>
              <MapPin className="h-4 w-4" />
            </Label>
            <Input
              placeholder="ابحث بمكان التفتيش"
              value={filters.inspectionLocation || ''}
              onChange={(e) => handleFilterChange('inspectionLocation', e.target.value)}
              className="text-right"
            />
          </div>

          {/* اسم الصيدلي */}
          <div className="space-y-2">
            <Label className="text-right flex items-center justify-end">
              <span className="mr-2">اسم الصيدلي</span>
              <User className="h-4 w-4" />
            </Label>
            <Input
              placeholder="ابحث باسم الصيدلي"
              value={filters.presentPharmacist || ''}
              onChange={(e) => handleFilterChange('presentPharmacist', e.target.value)}
              className="text-right"
            />
          </div>

          {/* البحث في المخالفات */}
          <div className="space-y-2">
            <Label className="text-right flex items-center justify-end">
              <span className="mr-2">البحث في المخالفات</span>
              <AlertTriangle className="h-4 w-4" />
            </Label>
            <Input
              placeholder="ابحث في نص المخالفات"
              value={filters.violationText || ''}
              onChange={(e) => handleFilterChange('violationText', e.target.value)}
              className="text-right"
            />
          </div>

          {/* جهات العمل */}
          <div className="space-y-2">
            <Label className="text-right flex items-center justify-end">
              <span className="mr-2">جهات العمل</span>
              <Building2 className="h-4 w-4" />
            </Label>
            <Input
              placeholder="ابحث بجهة العمل"
              value={filters.workPlace || ''}
              onChange={(e) => handleFilterChange('workPlace', e.target.value)}
              className="text-right"
            />
          </div>

          {/* إدارة المخزون */}
          <div className="space-y-2">
            <Label className="text-right">إدارة المخزون</Label>
            <InventorySelect
              value={filters.inventoryType || ''}
              onChange={(value) => handleFilterChange('inventoryType', value)}
            />
          </div>
        </div>

        {/* أزرار التحكم */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button
            onClick={handleSearchClick}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isSearching}
          >
            <Search className="ml-2 h-4 w-4" />
            {isSearching ? 'جاري البحث...' : 'بحث'}
          </Button>
          
          <Button
            onClick={onReset}
            variant="outline"
            className="flex-1 border-gray-300 hover:bg-gray-50"
            disabled={isSearching}
          >
            <RotateCcw className="ml-2 h-4 w-4" />
            إعادة تعيين
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

