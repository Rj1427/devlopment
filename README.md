import axios from 'axios';
import { getUser, createUser } from '../api/user';

jest.mock('axios'); // Mock axios

describe('User API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch a user by ID', async () => {
    const user = { id: 1, name: 'John Doe' };
    axios.get.mockResolvedValue({ data: user });

    const result = await getUser(1);
    expect(result).toEqual(user);
    expect(axios.get).toHaveBeenCalledWith('/api/users/1');
  });

  it('should create a new user', async () => {
    const newUser = { name: 'Jane Doe' };
    const createdUser = { id: 2, ...newUser };
    axios.post.mockResolvedValue({ data: createdUser });

    const result = await createUser(newUser);
    expect(result).toEqual(createdUser);
    expect(axios.post).toHaveBeenCalledWith('/api/users', newUser);
  });

  it('should handle getUser error', async () => {
    axios.get.mockRejectedValue(new Error('User not found'));

    await expect(getUser(999)).rejects.toThrow('User not found');
    expect(axios.get).toHaveBeenCalledWith('/api/users/999');
  });
});

  
