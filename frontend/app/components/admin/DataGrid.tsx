'use client';

import { AllCommunityModule, ModuleRegistry, type ColDef, themeQuartz } from 'ag-grid-community';
import { AgGridReact, type AgGridReactProps } from 'ag-grid-react';

ModuleRegistry.registerModules([AllCommunityModule]);

const defaultColDef: ColDef = {
  flex: 1,
  minWidth: 120,
  sortable: true,
  filter: true,
  resizable: true,
  cellStyle: { display: 'flex', alignItems: 'center' },
};

const theme = themeQuartz.withParams({
  // سطوح
  backgroundColor: 'var(--surface)',
  foregroundColor: 'var(--foreground)',
  borderColor: 'var(--border)',
  wrapperBorder: true,
  wrapperBorderRadius: 12,

  // هدر
  headerBackgroundColor: 'var(--background)',
  headerTextColor: 'var(--foreground)',
  headerFontWeight: 800,
  headerFontSize: 13,
  headerHeight: 48,
  headerColumnResizeHandleColor: 'var(--border)',

  // سطرها
  rowHeight: 60,
  oddRowBackgroundColor: 'transparent',
  rowBorder: { style: 'solid', width: 1, color: 'var(--border)' },
  rowHoverColor: 'var(--accent-soft)',
  selectedRowBackgroundColor: 'var(--accent-soft)',

  // رنگ تأکید (فوکوس، فیلتر، چک‌باکس)
  accentColor: 'var(--accent)',

  // فاصله‌ها و فونت
  cellHorizontalPaddingScale: 1.1,
  fontFamily: 'Vazir, Vazirmatn, sans-serif',
  fontSize: 13.5,

  // ورودی‌های فیلتر و منو
  inputBorder: { style: 'solid', width: 1, color: 'var(--border)' },
  inputBackgroundColor: 'var(--surface)',
  menuBackgroundColor: 'var(--surface)',
  popupShadow: '0 8px 24px rgba(0,0,0,0.08)',
});

const rowNumberColumn: ColDef = {
  headerName: 'ردیف',
  width: 80,
  maxWidth: 80,
  flex: 0,
  pinned: 'right',
  sortable: false,
  filter: false,
  resizable: false,
  cellStyle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--muted)',
    fontWeight: 700,
  },
  valueGetter: (params) => (params.node?.rowIndex ?? 0) + 1,
};

export default function DataGrid<T>({ columnDefs, ...props }: AgGridReactProps<T>) {
  const mergedColumnDefs = [rowNumberColumn, ...(columnDefs ?? [])];

  return (
    <div
      style={{ width: '100%', direction: 'rtl' }}
      className="overflow-hidden rounded-xl shadow-sm"
    >
      <AgGridReact<T>
        theme={theme}
        enableRtl
        columnDefs={mergedColumnDefs}
        defaultColDef={defaultColDef}
        animateRows
        suppressHorizontalScroll
        domLayout="autoHeight"
        overlayNoRowsTemplate="<span style='padding:12px;font-weight:700;'>موردی برای نمایش وجود ندارد</span>"
        {...props}
      />
    </div>
  );
}
