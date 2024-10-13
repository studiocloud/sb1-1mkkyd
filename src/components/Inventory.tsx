import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface InventoryItem {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
  cost: number;
  supplier_id: number;
}

const Inventory: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({ supplier_id: 1 }); // Set a default supplier_id
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('id', { ascending: true });
    if (error) console.error('Error fetching inventory:', error);
    else setInventory(data || []);
  };

  const handleAddItem = async () => {
    if (!newItem.product_name || newItem.quantity === undefined || newItem.price === undefined || newItem.cost === undefined) {
      setError('Product name, quantity, price, and cost are required.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('inventory')
        .insert([{ ...newItem, supplier_id: newItem.supplier_id || 1 }]) // Ensure supplier_id is set
        .select();

      if (error) {
        console.error('Error adding item:', error);
        if (error.code === '42501') {
          setError('Permission denied. Please check your database permissions.');
        } else if (error.code === '23505') {
          setError('An item with this name already exists. Please use a unique name.');
        } else {
          setError(`Failed to add item: ${error.message}`);
        }
      } else {
        setInventory([...inventory, data[0]]);
        setIsAdding(false);
        setNewItem({ supplier_id: 1 }); // Reset with default supplier_id
        setError(null);
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      setError(`An unexpected error occurred: ${error.message}`);
    }
  };

  const handleUpdateItem = async (id: number) => {
    const { error } = await supabase
      .from('inventory')
      .update(inventory.find(item => item.id === id))
      .eq('id', id);
    if (error) console.error('Error updating item:', error);
    else {
      setEditingId(null);
      fetchInventory();
    }
  };

  const handleDeleteItem = async (id: number) => {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);
    if (error) console.error('Error deleting item:', error);
    else {
      setInventory(inventory.filter(item => item.id !== id));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, id: number | null) => {
    const { name, value } = e.target;
    if (id === null) {
      setNewItem({ ...newItem, [name]: value });
    } else {
      setInventory(inventory.map(item => 
        item.id === id ? { ...item, [name]: value } : item
      ));
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">Inventory Management</h1>
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
        onClick={() => setIsAdding(true)}
      >
        <Plus className="inline-block mr-2" size={16} />
        Add New Item
      </button>
      {error && (
        <div className="bg-red-900 border border-red-700 text-white px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {isAdding && (
        <div className="mb-4 p-4 border border-gray-700 rounded bg-gray-800">
          <input
            type="text"
            name="product_name"
            placeholder="Product Name"
            value={newItem.product_name || ''}
            onChange={(e) => handleInputChange(e, null)}
            className="mb-2 p-2 w-full bg-gray-700 text-white rounded"
          />
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={newItem.quantity || ''}
            onChange={(e) => handleInputChange(e, null)}
            className="mb-2 p-2 w-full bg-gray-700 text-white rounded"
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={newItem.price || ''}
            onChange={(e) => handleInputChange(e, null)}
            className="mb-2 p-2 w-full bg-gray-700 text-white rounded"
          />
          <input
            type="number"
            name="cost"
            placeholder="Cost"
            value={newItem.cost || ''}
            onChange={(e) => handleInputChange(e, null)}
            className="mb-2 p-2 w-full bg-gray-700 text-white rounded"
          />
          <input
            type="number"
            name="supplier_id"
            placeholder="Supplier ID"
            value={newItem.supplier_id || ''}
            onChange={(e) => handleInputChange(e, null)}
            className="mb-2 p-2 w-full bg-gray-700 text-white rounded"
          />
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleAddItem}
          >
            Add Item
          </button>
        </div>
      )}
      <table className="min-w-full bg-gray-800">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-700">Product</th>
            <th className="py-2 px-4 border-b border-gray-700">Quantity</th>
            <th className="py-2 px-4 border-b border-gray-700">Price</th>
            <th className="py-2 px-4 border-b border-gray-700">Cost</th>
            <th className="py-2 px-4 border-b border-gray-700">Supplier ID</th>
            <th className="py-2 px-4 border-b border-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item.id}>
              <td className="py-2 px-4 border-b border-gray-700">
                {editingId === item.id ? (
                  <input
                    type="text"
                    name="product_name"
                    value={item.product_name}
                    onChange={(e) => handleInputChange(e, item.id)}
                    className="p-1 w-full bg-gray-700 text-white rounded"
                  />
                ) : (
                  item.product_name
                )}
              </td>
              <td className="py-2 px-4 border-b border-gray-700">
                {editingId === item.id ? (
                  <input
                    type="number"
                    name="quantity"
                    value={item.quantity}
                    onChange={(e) => handleInputChange(e, item.id)}
                    className="p-1 w-full bg-gray-700 text-white rounded"
                  />
                ) : (
                  item.quantity
                )}
              </td>
              <td className="py-2 px-4 border-b border-gray-700">
                {editingId === item.id ? (
                  <input
                    type="number"
                    name="price"
                    value={item.price}
                    onChange={(e) => handleInputChange(e, item.id)}
                    className="p-1 w-full bg-gray-700 text-white rounded"
                  />
                ) : (
                  `$${item.price.toFixed(2)}`
                )}
              </td>
              <td className="py-2 px-4 border-b border-gray-700">
                {editingId === item.id ? (
                  <input
                    type="number"
                    name="cost"
                    value={item.cost}
                    onChange={(e) => handleInputChange(e, item.id)}
                    className="p-1 w-full bg-gray-700 text-white rounded"
                  />
                ) : (
                  `$${item.cost.toFixed(2)}`
                )}
              </td>
              <td className="py-2 px-4 border-b border-gray-700">
                {editingId === item.id ? (
                  <input
                    type="number"
                    name="supplier_id"
                    value={item.supplier_id}
                    onChange={(e) => handleInputChange(e, item.id)}
                    className="p-1 w-full bg-gray-700 text-white rounded"
                  />
                ) : (
                  item.supplier_id
                )}
              </td>
              <td className="py-2 px-4 border-b border-gray-700">
                {editingId === item.id ? (
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-2 rounded mr-2"
                    onClick={() => handleUpdateItem(item.id)}
                  >
                    Save
                  </button>
                ) : (
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-2"
                    onClick={() => setEditingId(item.id)}
                  >
                    <Edit size={16} />
                  </button>
                )}
                <button
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                  onClick={() => handleDeleteItem(item.id)}
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Inventory;