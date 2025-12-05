'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SupabaseTest() {
  const [status, setStatus] = useState('Testing...');
  const [tables, setTables] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);

  useEffect(() => {
    async function testConnection() {
      try {
        // Test 1: Check Supabase connection
        console.log('🔍 Testing Supabase connection...');
        setStatus('Checking connection...');

        // Test 2: Try to query collections table
        const { data, error } = await supabase
          .from('collections')
          .select('*')
          .limit(5);

        if (error) {
          console.error('❌ Error:', error);
          setStatus(`Error: ${error.message || JSON.stringify(error)}`);
        } else {
          console.log('✅ Success! Data:', data);
          setCollections(data || []);
          setStatus('✅ Connection successful!');
        }

        // Test 3: Try to get table info
        const { data: tableData, error: tableError } = await supabase
          .rpc('get_tables');
        
        if (!tableError && tableData) {
          setTables(tableData);
        }

      } catch (err: any) {
        console.error('❌ Exception:', err);
        setStatus(`Exception: ${err.message}`);
      }
    }

    testConnection();
  }, []);

  return (
    <div style={{ padding: 20, background: '#f5f5f5', borderRadius: 8, margin: 20 }}>
      <h2>🔧 Supabase Connection Test</h2>
      
      <div style={{ marginTop: 20 }}>
        <h3>Status:</h3>
        <p style={{ 
          padding: 10, 
          background: status.includes('Error') ? '#fee' : status.includes('✅') ? '#efe' : '#fff',
          borderRadius: 4 
        }}>
          {status}
        </p>
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>Collections Found: {collections.length}</h3>
        {collections.length > 0 ? (
          <ul>
            {collections.map((col, i) => (
              <li key={i}>
                <strong>{col.title}</strong> - {col.user_id}
                {col.cover_image_url && ' (has image)'}
              </li>
            ))}
          </ul>
        ) : (
          <p>No collections found (table might be empty)</p>
        )}
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>Environment Check:</h3>
        <ul>
          <li>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</li>
          <li>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</li>
        </ul>
      </div>

      <div style={{ marginTop: 20, padding: 10, background: '#fff', borderRadius: 4 }}>
        <h3>Next Steps:</h3>
        <ol>
          <li>If you see "Error", open Supabase SQL Editor</li>
          <li>Run: <code>ALTER TABLE collections DISABLE ROW LEVEL SECURITY;</code></li>
          <li>Check if the table exists: <code>SELECT * FROM collections;</code></li>
          <li>Refresh this page</li>
        </ol>
      </div>
    </div>
  );
}
