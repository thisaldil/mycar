import { cn } from '../../utils/cn';

/**
 * columns: [{ key, header, render?, align?, className?, cellClassName? }]
 * Rows become keyboard-activatable when onRowClick is provided.
 */
export function Table({ columns, rows, getRowKey = (r) => r.id, onRowClick, caption, className }) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-left text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className="border-b border-line">
            {columns.map((c) =>
            <th
              key={c.key}
              scope="col"
              className={cn('whitespace-nowrap px-4 py-3 text-xs font-medium text-ink-muted first:pl-5 last:pr-5', c.align === 'right' && 'text-right', c.className)}>
              
                {c.header}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) =>
          <tr
            key={getRowKey(row)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            onKeyDown={
            onRowClick ?
            (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onRowClick(row);
              }
            } :
            undefined
            }
            tabIndex={onRowClick ? 0 : undefined}
            className={cn(onRowClick && 'cursor-pointer transition-colors duration-100 hover:bg-subtle focus-visible:bg-subtle focus-visible:outline-offset-[-2px]')}>
            
              {columns.map((c) =>
            <td
              key={c.key}
              className={cn('px-4 py-3.5 align-middle text-ink first:pl-5 last:pr-5', c.align === 'right' && 'text-right tnum', c.cellClassName)}>
              
                  {c.render ? c.render(row) : row[c.key]}
                </td>
            )}
            </tr>
          )}
        </tbody>
      </table>
    </div>);

}