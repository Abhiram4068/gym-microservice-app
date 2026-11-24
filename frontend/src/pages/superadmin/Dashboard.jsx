import React from 'react';
import { Link } from 'react-router-dom';

const statsData = [
  {
    label: 'Total Revenue',
    value: '₹44,991',
    bgColor: 'bg-[#f4fdf8]', // soft mint tint
    borderColor: 'border-[#e3f7ed]'
  },
  {
    label: 'Total Tenants',
    value: '4',
    bgColor: 'bg-[#fbfcf6]', // soft creamy yellowish tint
    borderColor: 'border-[#f3f5e7]'
  },
  {
    label: 'Active Subs',
    value: '5',
    bgColor: 'bg-[#fdfcf6]', // soft warm tint
    borderColor: 'border-[#f6f3e5]'
  },
  {
    label: 'Total Plans',
    value: '4',
    bgColor: 'bg-[#f6fcf9]', // pale mint
    borderColor: 'border-[#e6f7ef]'
  },
  {
    label: 'Total Features',
    value: '7',
    bgColor: 'bg-[#fdf7f9]', // pale rose
    borderColor: 'border-[#faebf0]'
  },
  {
    label: 'Popular Plan',
    value: 'Free Plan',
    bgColor: 'bg-[#fefbf7]', // pale peach
    borderColor: 'border-[#faefe3]'
  },
  {
    label: 'Support Tickets',
    value: '2',
    bgColor: 'bg-[#f7fbfe]', // pale ice blue
    borderColor: 'border-[#e6f3fa]'
  },
  {
    label: 'Recent Tenants',
    value: '+0',
    bgColor: 'bg-[#f8fcf8]', // pale sage
    borderColor: 'border-[#e7f4e8]'
  },
  {
    label: 'Recent Payments',
    value: '–',
    bgColor: 'bg-[#f7fbfe]', // pale soft blue
    borderColor: 'border-[#e4f0f9]'
  },
  {
    label: 'Total Users',
    value: '13',
    bgColor: 'bg-[#fefaf7]', // pale soft orange
    borderColor: 'border-[#faeee5]'
  }
];

const recentTenants = [
  {
    name: 'CloudMatrix Technologies Pvt Ltd',
    plan: 'Free Plan',
    status: 'Active',
    mrr: '₹ 0'
  },
  {
    name: 'NextGen Business Solutions Pvt Ltd',
    plan: 'Business Plan',
    status: 'Active',
    mrr: '₹ 4999'
  },
  {
    name: 'Acme Software Solutions Pvt Ltd',
    plan: 'Enterprise Plan',
    status: 'Active',
    mrr: '₹ 7999'
  },
  {
    name: 'Vertex Consulting Services Pvt Ltd',
    plan: 'Free Plan',
    status: 'Active',
    mrr: '₹ 0'
  }
];

const activePlans = [
  {
    name: 'Free Plan',
    billing: 'Monthly/Yearly',
    tenants: 2,
    price: '$0'
  },
  {
    name: 'Professional Plan',
    billing: 'Monthly/Yearly',
    tenants: 0,
    price: '$2999'
  },
  {
    name: 'Business Plan',
    billing: 'Monthly/Yearly',
    tenants: 2,
    price: '$4999'
  },
  {
    name: 'Enterprise Plan',
    billing: 'Monthly/Yearly',
    tenants: 1,
    price: '$7999'
  }
];

const Dashboard = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-1">
        <h1 className="text-[22px] font-bold tracking-tight text-[#111827]">
          Dashboard
        </h1>
        <span className="text-[13px] font-medium text-[#6b7280]">
          {currentDate}
        </span>
      </div>

      {/* 10 Stats Cards Grid (5 columns on desktop, responsive) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4">
        {statsData.map((item, idx) => (
          <div
            key={idx}
            className={`${item.bgColor} border ${item.borderColor} rounded-xl p-4 sm:p-5 flex flex-col justify-between min-h-[96px] sm:min-h-[105px] shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition hover:shadow-sm`}
          >
            <div className="text-[19px] sm:text-[22px] font-extrabold text-[#111827] tracking-tight truncate">
              {item.value}
            </div>
            <div className="text-[12px] sm:text-[12.5px] font-medium text-[#64748b] mt-1">
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Tables Grid */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 pt-2">
        // Recent Tenants Card
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[15px] font-bold text-[#111827]">
              Recent Tenants
            </h2>
            <Link
              to="/admin/owners"
              className="text-[12.5px] font-semibold text-[#2563eb] hover:text-[#1d4ed8] transition no-underline"
            >
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Tenant Name</th>
                  <th className="pb-3 font-semibold">Plan</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">MRR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentTenants.map((tenant, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 pr-3 font-bold text-[#1e293b]">
                      {tenant.name}
                    </td>
                    <td className="py-3.5 px-3 text-[#64748b]">
                      {tenant.plan}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#e6f9ed] text-[#16a34a]">
                        {tenant.status}
                      </span>
                    </td>
                    <td className="py-3.5 pl-3 text-right font-medium text-[#1e293b]">
                      {tenant.mrr}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        // Active Plans Card
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[15px] font-bold text-[#111827]">
              Active Plans
            </h2>
            <Link
              to="/admin/plans"
              className="text-[12.5px] font-semibold text-[#2563eb] hover:text-[#1d4ed8] transition no-underline"
            >
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Plan Name</th>
                  <th className="pb-3 font-semibold">Billing</th>
                  <th className="pb-3 font-semibold text-center">Tenants</th>
                  <th className="pb-3 font-semibold text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activePlans.map((plan, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 pr-3 font-bold text-[#1e293b]">
                      {plan.name}
                    </td>
                    <td className="py-3.5 px-3 text-[#64748b]">
                      {plan.billing}
                    </td>
                    <td className="py-3.5 px-3 text-center text-[#64748b]">
                      {plan.tenants}
                    </td>
                    <td className="py-3.5 pl-3 text-right font-bold text-[#1e293b]">
                      {plan.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Dashboard;
