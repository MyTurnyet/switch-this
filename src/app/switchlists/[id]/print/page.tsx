'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SwitchlistService } from '@/app/shared/services/SwitchlistService';
import { TrainRouteService } from '@/app/shared/services/TrainRouteService';
import { RollingStockService } from '@/app/shared/services/RollingStockService';
import { LocationService } from '@/app/shared/services/LocationService';
import { Switchlist, TrainRoute, RollingStock } from '@/app/shared/types/models';
import { Location } from '@/shared/types/models';

export default function SwitchlistPrintPage({ params }: { params: { id: string } }) {
  const [switchlist, setSwitchlist] = useState<Switchlist | null>(null);
  const [trainRoute, setTrainRoute] = useState<TrainRoute | null>(null);
  const [rollingStock, setRollingStock] = useState<RollingStock[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate] = useState<string>(new Date().toLocaleDateString());
  
  const switchlistService = new SwitchlistService();
  const trainRouteService = new TrainRouteService();
  const rollingStockService = new RollingStockService();
  const locationService = new LocationService();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get switchlist details
        const switchlistData = await switchlistService.getSwitchlistById(params.id);
        setSwitchlist(switchlistData);
        
        // Get associated train route
        const trainRouteData = await trainRouteService.getTrainRouteById(switchlistData.trainRouteId);
        setTrainRoute(trainRouteData);
        
        // Get all locations for name lookups
        const locationsData = await locationService.getAllLocations();
        setLocations(locationsData);
        
        // Get all rolling stock
        const rollingStockData = await rollingStockService.getAllRollingStock();
        
        // In a real implementation, we would fetch assigned rolling stock from the backend
        // For now, we'll just simulate with 5 random cars from the available stock
        const sampleSize = Math.min(5, rollingStockData.length);
        const randomCars = [...rollingStockData]
          .sort(() => 0.5 - Math.random())
          .slice(0, sampleSize);
        
        setRollingStock(randomCars);
        setError(null);
      } catch (err) {
        console.error('Error fetching switchlist data:', err);
        setError('Failed to load switchlist data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [params.id]);
  
  const handlePrint = () => {
    window.print();
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get location name from ID
  const getLocationName = (locationId?: string) => {
    if (!locationId) return 'Unknown';
    const location = locations.find(loc => loc._id === locationId);
    return location ? location.stationName : 'Unknown';
  };
  
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Loading switchlist data...</p>
        </div>
      </div>
    );
  }
  
  if (error || !switchlist || !trainRoute) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || 'Failed to load switchlist data.'}
        </div>
        <Link href={`/switchlists/${params.id}`} className="text-primary-600 hover:underline">
          ← Back to Switchlist
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Navigation/controls - hidden when printing */}
      <div className="print:hidden mb-6">
        <div className="flex justify-between items-center">
          <Link href={`/switchlists/${params.id}`} className="text-primary-600 hover:underline">
            ← Back to Switchlist
          </Link>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Switchlist
          </button>
        </div>
      </div>
      
      {/* Print-friendly content */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden print:shadow-none print:rounded-none">
        {/* Header */}
        <div className="border-b-2 border-gray-800 p-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold">{switchlist.name}</h1>
              <div className="mt-2">
                <span className="font-semibold">Train Route:</span> {trainRoute.name} ({trainRoute.routeNumber})
              </div>
              <div className="mt-1">
                <span className="font-semibold">Date:</span> {formatDate(switchlist.createdAt)}
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end">
              <div className="px-3 py-1 bg-gray-100 border border-gray-300 rounded mb-2">
                <span className="font-semibold">Status:</span> {switchlist.status}
              </div>
              <div className="text-sm">
                <p><span className="font-semibold">Printed:</span> {currentDate}</p>
                <p><span className="font-semibold">Document ID:</span> {switchlist._id.substring(0, 8)}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Instructions */}
        <div className="border-b border-gray-300 p-4 bg-gray-50">
          <div className="font-semibold text-lg mb-2">Instructions:</div>
          <p className="whitespace-pre-line">
            {switchlist.notes || 'No specific instructions provided for this switchlist.'}
          </p>
        </div>
        
        {/* Car List */}
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-300 pb-2">Car Movement Operations</h2>
          <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-300">No.</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-300">Car</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-300">Type</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-300">From</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-300">To</th>
                <th className="px-2 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider w-16">Completed</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rollingStock.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
                    No cars assigned to this switchlist.
                  </td>
                </tr>
              ) : (
                rollingStock.map((car, index) => (
                  <tr key={car._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-2 py-3 border-r border-gray-300 text-center">{index + 1}</td>
                    <td className="px-2 py-3 font-medium border-r border-gray-300">{car.roadName} {car.roadNumber}</td>
                    <td className="px-2 py-3 border-r border-gray-300">{car.aarType}</td>
                    <td className="px-2 py-3 border-r border-gray-300">Yard Track {Math.floor(Math.random() * 5) + 1}</td>
                    <td className="px-2 py-3 border-r border-gray-300">
                      {car.destination?.finalDestination ? (
                        <>
                          <div>{getLocationName(car.destination.finalDestination.locationId)}</div>
                          <div className="text-xs text-gray-500">via Fiddle Yard</div>
                        </>
                      ) : (
                        `Industry Track ${Math.floor(Math.random() * 10) + 1}`
                      )}
                    </td>
                    <td className="py-3 text-center">
                      {/* Empty checkbox for print view - square border that can be checked manually */}
                      <div className="inline-block h-5 w-5 border-2 border-gray-700"></div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Operations Summary */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-300 rounded p-3 bg-gray-50">
              <h3 className="font-bold mb-2">Operation Summary:</h3>
              <ul className="list-disc pl-5">
                <li>Total Cars: {rollingStock.length}</li>
                <li>Estimated Switching Time: {Math.ceil(rollingStock.length * 1.5)} minutes</li>
                <li>Priority: {switchlist.status === 'IN_PROGRESS' ? 'High' : 'Normal'}</li>
              </ul>
            </div>
            <div className="border border-gray-300 rounded p-3 bg-gray-50">
              <h3 className="font-bold mb-2">Special Instructions:</h3>
              <p className="text-sm">
                {switchlist.notes ? 
                  switchlist.notes.substring(0, 100) + (switchlist.notes.length > 100 ? '...' : '') : 
                  'Handle with care. Notify dispatcher when operations are completed.'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Notes section */}
        <div className="p-6 border-t border-gray-300">
          <h3 className="font-bold mb-2">Additional Notes:</h3>
          <div className="min-h-24 border border-gray-500 rounded p-2 print:min-h-32"></div>
        </div>
        
        {/* Footer with signature line */}
        <div className="p-6 border-t border-gray-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div>
              <div className="border-t border-gray-500 pt-1">
                <p className="text-sm text-gray-600">Conductor Signature</p>
              </div>
            </div>
            <div>
              <div className="border-t border-gray-500 pt-1">
                <p className="text-sm text-gray-600">Date & Time Completed</p>
              </div>
            </div>
            <div>
              <div className="border-t border-gray-500 pt-1">
                <p className="text-sm text-gray-600">Supervisor Verification</p>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 mt-8 text-center">
            <p>Form ID: SL-{switchlist._id.substring(0, 6)} | Generated: {currentDate} | Page 1 of 1</p>
          </div>
        </div>
      </div>
      
      {/* Print-specific styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            margin: 0.5cm;
            size: portrait;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            font-size: 12pt;
          }
          table {
            page-break-inside: avoid;
          }
          tr {
            page-break-inside: avoid;
          }
          .page-break {
            page-break-before: always;
          }
        }
      `}} />
    </div>
  );
} 