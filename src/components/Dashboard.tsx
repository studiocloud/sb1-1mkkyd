import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [totalSales, setTotalSales] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [itemsSold, setItemsSold] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('quantity, price');

      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('cost');

      if (salesError || inventoryError) throw salesError || inventoryError;

      let sales = 0;
      let items = 0;
      salesData?.forEach((sale) => {
        sales += sale.quantity * sale.price;
        items += sale.quantity;
      });

      let cost = 0;
      inventoryData?.forEach((item) => {
        cost += item.cost;
      });

      setTotalSales(sales);
      setTotalCost(cost);
      setItemsSold(items);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Total Sales</h2>
          <DollarSign className="text-green-400" size={24} />
        </div>
        <p className="text-3xl font-bold mt-2">${totalSales.toFixed(2)}</p>
      </div>
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Total Cost</h2>
          <TrendingUp className="text-red-400" size={24} />
        </div>
        <p className="text-3xl font-bold mt-2">${totalCost.toFixed(2)}</p>
      </div>
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Items Sold</h2>
          <ShoppingCart className="text-blue-400" size={24} />
        </div>
        <p className="text-3xl font-bold mt-2">{itemsSold}</p>
      </div>
      <div className="bg-gray-800 p-6 rounded-lg shadow-md col-span-full">
        <h2 className="text-xl font-semibold mb-2">Profit</h2>
        <p className="text-3xl font-bold">${(totalSales - totalCost).toFixed(2)}</p>
      </div>
    </div>
  );
};

export default Dashboard;