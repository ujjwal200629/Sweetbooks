import React from "react";

interface ThermalReceiptProps {
  invoice: any;
  shopName?: string;
  address?: string;
  phone?: string;
  gstin?: string;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({
  invoice,
  shopName = "Sweetbook Bakery",
  address = "123 Main Street, City Center",
  phone = "+91 9876543210",
  gstin = "27ABCDE1234F1Z5",
}) => {
  if (!invoice) return null;

  const invoiceDate = new Date(invoice.createdAt || new Date());
  
  return (
    <div className="hidden print:block print:w-[80mm] print:m-0 print:p-2 bg-white text-black font-mono text-sm leading-tight max-w-[80mm] mx-auto absolute top-0 left-0 right-0 z-50">
      
      {/* HEADER */}
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold uppercase tracking-widest mb-1">{shopName}</h1>
        <p className="text-xs">{address}</p>
        <p className="text-xs">Ph: {phone}</p>
        <p className="text-xs">GSTIN: {gstin}</p>
      </div>

      <div className="border-t border-dashed border-black my-2"></div>

      {/* META */}
      <div className="text-xs mb-2 space-y-1">
        <div className="flex justify-between">
          <span>Bill No: <span className="font-bold">{invoice.invoiceNumber || invoice.id?.slice(-6).toUpperCase()}</span></span>
          <span>{invoiceDate.toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Cashier: Admin</span>
          <span>{invoiceDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        {invoice.customer && (
          <div className="mt-1">
            <span>Customer: {invoice.customer.name || invoice.customer.phone}</span>
          </div>
        )}
      </div>

      <div className="border-t border-dashed border-black my-2"></div>

      {/* ITEMS */}
      <table className="w-full text-xs text-left mb-2">
        <thead>
          <tr className="border-b border-dashed border-black">
            <th className="py-1 font-bold">Item</th>
            <th className="py-1 text-right font-bold w-12">Qty</th>
            <th className="py-1 text-right font-bold w-16">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items && invoice.items.map((item: any, idx: number) => {
            const itemName = item.product?.name || item.name || "Unknown Item";
            const price = item.price || 0;
            const discount = item.discount || 0;
            const finalLineTotal = (price * item.quantity) - discount;
            return (
              <tr key={idx} className="align-top">
                <td className="py-1 pr-1">
                  <div>{itemName}</div>
                  <div className="text-[10px] text-gray-600">@ ₹{price.toFixed(2)}</div>
                  {discount > 0 && <div className="text-[10px] text-gray-600">-₹{discount.toFixed(2)} off</div>}
                </td>
                <td className="py-1 text-right">{item.quantity}</td>
                <td className="py-1 text-right">₹{finalLineTotal.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="border-t border-dashed border-black my-2"></div>

      {/* TOTALS */}
      <div className="text-xs space-y-1 mb-2">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₹{(invoice.subtotal || 0).toFixed(2)}</span>
        </div>
        {invoice.globalDiscount > 0 && (
          <div className="flex justify-between">
            <span>Discount</span>
            <span>-₹{(invoice.globalDiscount || 0).toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>GST Taxes</span>
          <span>₹{(invoice.totalGst || 0).toFixed(2)}</span>
        </div>
        {invoice.additionalCharges > 0 && (
          <div className="flex justify-between">
            <span>Addt. Charges</span>
            <span>+₹{(invoice.additionalCharges || 0).toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-bold mt-2 pt-1 border-t border-dashed border-black">
          <span>GRAND TOTAL</span>
          <span>₹{(invoice.grandTotal || 0).toFixed(2)}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-black my-2"></div>

      {/* FOOTER */}
      <div className="text-center text-xs mt-4 space-y-1">
        <p className="font-bold">THANK YOU FOR VISITING!</p>
        <p>Please visit again.</p>
        <p className="mt-2 text-[10px] text-gray-500">Powered by Antigravity POS</p>
      </div>

      {/* Extra space at bottom for thermal cutter */}
      <div className="h-8"></div>
    </div>
  );
};
