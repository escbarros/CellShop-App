import { validateEnvironment } from './environment';

const COMPLETE_ENVIRONMENT = {
  PORT: '3333',
  CORS_ORIGIN: 'http://localhost:5173',
  CHAOS_ENABLED: 'true',
  IMAGES_BASE_URL: '/images',
};

describe('validateEnvironment', () => {
  it('turns the raw variables into a typed environment', () => {
    expect(validateEnvironment(COMPLETE_ENVIRONMENT)).toEqual({
      PORT: 3333,
      CORS_ORIGIN: 'http://localhost:5173',
      CHAOS_ENABLED: true,
      IMAGES_BASE_URL: '/images',
    });
  });

  it('names the missing variable instead of letting the boot fail later', () => {
    const { CORS_ORIGIN: _removed, ...withoutCorsOrigin } = COMPLETE_ENVIRONMENT;

    expect(() => validateEnvironment(withoutCorsOrigin)).toThrow('CORS_ORIGIN');
  });

  it('reports every missing variable at once', () => {
    expect(() => validateEnvironment({})).toThrow(
      /PORT[\s\S]*CORS_ORIGIN[\s\S]*CHAOS_ENABLED[\s\S]*IMAGES_BASE_URL/,
    );
  });

  it('refuses a blank variable', () => {
    expect(() => validateEnvironment({ ...COMPLETE_ENVIRONMENT, IMAGES_BASE_URL: '   ' })).toThrow(
      'IMAGES_BASE_URL',
    );
  });

  it('refuses a port that is not a whole number inside the valid range', () => {
    expect(() => validateEnvironment({ ...COMPLETE_ENVIRONMENT, PORT: 'nope' })).toThrow('PORT');
    expect(() => validateEnvironment({ ...COMPLETE_ENVIRONMENT, PORT: '70000' })).toThrow('PORT');
  });

  it('refuses a chaos flag that is neither true nor false', () => {
    expect(() => validateEnvironment({ ...COMPLETE_ENVIRONMENT, CHAOS_ENABLED: 'yes' })).toThrow(
      'CHAOS_ENABLED',
    );
  });
});
