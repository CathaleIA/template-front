// lib/auth-service.ts
export interface CognitoTokens {
  access_token: string;
  id_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface UserInfo {
  userId: string;
  userName: string;
  email: string;
  tenantId: string;
  userRole: string;
  createdDate: string;
  modifiedDate: string;
  isEnabled: boolean;
}

export class AuthService {
  private static readonly API_BASE_URL = process.env.NEXT_PUBLIC_REG_API_GATEWAY_URL;

  /**
   * Obtiene los tokens de Cognito desde las cookies
   */
  static async getTokens(): Promise<CognitoTokens | null> {
    try {
      const response = await fetch('/api/auth/tokens', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting tokens:', error);
      return null;
    }
  }

  /**
   * Verifica si los tokens están expirados
   */
  static isTokenExpired(expiresAt: number): boolean {
    return Date.now() >= expiresAt;
  }

  /**
   * Refresca el access token usando el refresh token
   */
  static async refreshAccessToken(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      return response.ok;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }

  /**
   * Obtiene información del usuario actual
   */
  static async getCurrentUser(): Promise<UserInfo | null> {
    try {
      const tokens = await this.getTokens();
      if (!tokens) {
        return null;
      }

      // Verificar si el token está expirado
      if (this.isTokenExpired(tokens.expires_at)) {
        const refreshed = await this.refreshAccessToken();
        if (!refreshed) {
          return null;
        }
        // Obtener tokens actualizados
        const newTokens = await this.getTokens();
        if (!newTokens) {
          return null;
        }
        tokens.access_token = newTokens.access_token;
      }

      // Decodificar el ID token para obtener el username
      const payload = this.decodeJWT(tokens.id_token);
      const username = payload['cognito:username'] || payload.sub;

      return await this.getUserByUsername(username, tokens.access_token);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Obtiene información de un usuario por username
   */
  static async getUserByUsername(username: string, accessToken?: string): Promise<UserInfo | null> {
    try {
      let token = accessToken;
      
      if (!token) {
        const tokens = await this.getTokens();
        if (!tokens) {
          throw new Error('No access token available');
        }
        token = tokens.access_token;
      }

      const response = await fetch(`${this.API_BASE_URL}/user/${username}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  /**
   * Decodifica un JWT (solo para leer el payload, no para validar)
   */
  private static decodeJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return {};
    }
  }

  /**
   * Cierra sesión eliminando las cookies
   */
  static async logout(): Promise<void> {
    try {
      console.log("llamando a logout pi")
      await fetch('/api/auth/logout', {
        method: 'GET',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
}