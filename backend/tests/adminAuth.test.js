import { describe, expect, it, vi } from 'vitest'
import {
  getAdminSession,
  loginAdmin,
} from '../src/controllers/adminAuthController.js'
import { requireAdminAuth } from '../src/middlewares/adminAuth.js'
import { ADMIN_SESSION_COOKIE_NAME } from '../src/services/adminAuthService.js'

function createResponse() {
  return {
    cookie: vi.fn(),
    clearCookie: vi.fn(),
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  }
}

describe('admin authentication flow', () => {
  it('rejects protected admin access without a valid session cookie', () => {
    const request = {
      headers: {},
    }
    const next = vi.fn()

    requireAdminAuth(request, {}, next)

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        errorCode: 'ADMIN_AUTH_REQUIRED',
      }),
    )
  })

  it('logs in with env-backed credentials and resolves the active session', () => {
    const loginRequest = {
      validatedBody: {
        username: 'admin',
        password: 'change-me-admin',
      },
    }
    const loginResponse = createResponse()
    const loginNext = vi.fn()

    loginAdmin(loginRequest, loginResponse, loginNext)

    expect(loginNext).not.toHaveBeenCalled()
    expect(loginResponse.cookie).toHaveBeenCalledWith(
      ADMIN_SESSION_COOKIE_NAME,
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
      }),
    )
    expect(loginResponse.status).toHaveBeenCalledWith(200)
    expect(loginResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          username: 'admin',
        }),
      }),
    )

    const sessionToken = loginResponse.cookie.mock.calls[0][1]
    const sessionRequest = {
      headers: {
        cookie: `${ADMIN_SESSION_COOKIE_NAME}=${sessionToken}`,
      },
    }
    const sessionResponse = createResponse()
    const sessionNext = vi.fn()

    getAdminSession(sessionRequest, sessionResponse, sessionNext)

    expect(sessionNext).not.toHaveBeenCalled()
    expect(sessionResponse.status).toHaveBeenCalledWith(200)
    expect(sessionResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          username: 'admin',
        }),
      }),
    )
  })

  it('rejects invalid admin credentials', () => {
    const request = {
      validatedBody: {
        username: 'admin',
        password: 'wrong-password',
      },
    }
    const response = createResponse()
    const next = vi.fn()

    loginAdmin(request, response, next)

    expect(response.cookie).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        errorCode: 'INVALID_ADMIN_CREDENTIALS',
      }),
    )
  })
})
