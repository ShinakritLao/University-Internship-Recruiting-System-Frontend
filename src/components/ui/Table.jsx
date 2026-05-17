import React from "react";

export function Table({ className = "", children, ...rest }) {
  return (
    <div className="ui-table-wrapper">
      <table className={`ui-table ${className}`} {...rest}>
        {children}
      </table>
    </div>
  );
}

Table.Head = function TableHead({ children }) {
  return <thead>{children}</thead>;
};

Table.Body = function TableBody({ children }) {
  return <tbody>{children}</tbody>;
};

Table.Row = function TableRow({ children, ...rest }) {
  return <tr {...rest}>{children}</tr>;
};

Table.HeaderCell = function TableHeaderCell({ children, ...rest }) {
  return <th {...rest}>{children}</th>;
};

Table.Cell = function TableCell({ children, ...rest }) {
  return <td {...rest}>{children}</td>;
};
