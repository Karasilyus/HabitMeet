jest.mock('../src/models/activityTypeModel');

const activityTypeModel = require('../src/models/activityTypeModel');
const { createType, resolveTypeId } = require('../src/services/activityTypeService');

describe('activityTypeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createType rejects names shorter than 2 characters', async () => {
    await expect(createType(1, 'A')).rejects.toMatchObject({ status: 400 });
  });

  test('createType rejects forbidden words', async () => {
    await expect(createType(1, 'siktir koşu')).rejects.toMatchObject({ status: 400 });
  });

  test('createType throws 409 when type already exists', async () => {
    activityTypeModel.findByName.mockResolvedValue({ id: 3, name: 'Koşu' });
    await expect(createType(1, 'Koşu')).rejects.toMatchObject({ status: 409 });
  });

  test('createType creates new type', async () => {
    activityTypeModel.findByName.mockResolvedValue(null);
    activityTypeModel.create.mockResolvedValue({ id: 10, name: 'Yüzme' });

    const type = await createType(1, '  Yüzme  ');
    expect(type.id).toBe(10);
    expect(activityTypeModel.create).toHaveBeenCalledWith({
      name: 'Yüzme',
      createdBy: 1,
    });
  });

  test('resolveTypeId returns existing type by id', async () => {
    activityTypeModel.findById.mockResolvedValue({ id: 2, name: 'Koşu' });
    const type = await resolveTypeId(1, { type_id: 2 });
    expect(type.name).toBe('Koşu');
  });

  test('resolveTypeId throws 400 when neither id nor name given', async () => {
    await expect(resolveTypeId(1, {})).rejects.toMatchObject({ status: 400 });
  });
});
