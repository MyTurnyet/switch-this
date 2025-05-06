/**
 * API Test Template
 * 
 * This file provides a template and examples for testing API routes with our MongoDB mocking utilities.
 * You can use this as a starting point for creating tests for API routes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createMockMongoService } from './mongodb-test-utils';

/**
 * Example of how to set up mocks for the NextResponse
 */
export const setupNextResponseMock = (): void => {
  jest.mock('next/server', () => ({
    NextResponse: {
      json: jest.fn(),
      next: jest.fn()
    }
  }));
};

/**
 * Example of how to mock the MongoDB provider
 */
export const setupMongoDbProviderMock = (): void => {
  jest.mock('@/lib/services/mongodb.provider', () => {
    return {
      MongoDbProvider: jest.fn().mockImplementation(() => ({
        getService: jest.fn().mockReturnValue(createMockMongoService())
      }))
    };
  });
};

/**
 * Example test setup for an API route
 */
export const exampleApiTestSetup = () => {
  // Mock request setup
  const mockRequestJson = jest.fn();
  const mockRequest = {
    json: mockRequestJson
  } as unknown as NextRequest;
  
  // MongoDB mock setup
  const mockMongoService = createMockMongoService();
  const mockCollection = mockMongoService.getLocationsCollection();
  
  // Return all the mocks needed
  return {
    mockRequest,
    mockRequestJson,
    mockMongoService,
    mockCollection
  };
};

/**
 * Example test for GET routes
 */
export const exampleGetRouteTest = async (getHandler: (req: NextRequest) => Promise<Response>): Promise<void> => {
  // Setup mocks
  const { mockRequest, mockCollection } = exampleApiTestSetup();
  
  // Mock data 
  const mockData = [{ _id: '1', name: 'Test Item' }];
  
  // Setup mock response
  // Using type assertion since we know we're working with mocks
  (mockCollection.find as jest.Mock).mockReturnValue({
    toArray: jest.fn().mockResolvedValue(mockData)
  });
  
  // Call the handler
  await getHandler(mockRequest);
  
  // Verify response was called correctly
  expect(NextResponse.json).toHaveBeenCalledWith(
    mockData,
    expect.any(Object)
  );
};

/**
 * Example test for POST routes
 */
export const examplePostRouteTest = async (postHandler: (req: NextRequest) => Promise<Response>): Promise<void> => {
  // Setup mocks
  const { mockRequest, mockRequestJson, mockCollection } = exampleApiTestSetup();
  
  // Mock request data
  const newItem = { name: 'New Item' };
  mockRequestJson.mockResolvedValue(newItem);
  
  // Mock database response
  // Using type assertion since we know we're working with mocks
  (mockCollection.insertOne as jest.Mock).mockResolvedValue({ 
    insertedId: '123', 
    acknowledged: true 
  });
  
  // Call the handler
  await postHandler(mockRequest);
  
  // Verify response
  expect(NextResponse.json).toHaveBeenCalledWith(
    expect.objectContaining({ 
      _id: expect.any(String),
      ...newItem 
    }),
    expect.objectContaining({ status: 201 })
  );
}; 