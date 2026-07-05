"use client";

import {
  AllCommunityModule,
  ModuleRegistry,
  type ColDef,
  themeQuartz,
} from "ag-grid-community";

import { AgGridReact, type AgGridReactProps } from "ag-grid-react";

ModuleRegistry.registerModules([AllCommunityModule]);

const defaultColDef: ColDef = {
  flex: 1,
  minWidth: 120,
  sortable: true,
  filter: true,
  resizable: true,
};

const theme = themeQuartz.withParams({
  backgroundColor: "var(--surface)",
  foregroundColor: "var(--foreground)",
  headerBackgroundColor: "var(--surface)",
  headerTextColor: "var(--muted)",
  oddRowBackgroundColor: "var(--background)",
  rowHoverColor: "var(--accent-soft)",
  selectedRowBackgroundColor: "var(--accent-soft)",
  borderColor: "var(--border)",
  fontFamily: "Vazir, Vazirmatn, sans-serif",
  fontSize: 13.5,
  headerHeight: 46,
  rowHeight: 56,
});

const rowNumberColumn: ColDef = {
  headerName: "ردیف",
  width: 5,
  pinned: "right",
  sortable: false,
  filter: false,
  resizable: false,
  valueGetter: (params) => (params.node?.rowIndex ?? 0) + 1,
};

export default function DataGrid<T>({
  height = 520,
  columnDefs,
  ...props
}: AgGridReactProps<T> & { height?: number | string }) {
  const mergedColumnDefs = [rowNumberColumn, ...(columnDefs ?? [])];

  return (
    <div
      className="ag-theme-fitmokamel"
      style={{
        width: "100%",
        height,
        direction: "rtl",
        overflow: "hidden",
      }}
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
