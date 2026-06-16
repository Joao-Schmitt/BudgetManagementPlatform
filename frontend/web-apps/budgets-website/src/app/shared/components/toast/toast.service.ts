import { Injectable } from '@angular/core';

import { toast, type ExternalToast } from 'ngx-sonner';

@Injectable({ providedIn: 'root' })
export class ToastService {
  success(title: string, description?: string, options?: ExternalToast): string | number {
    return toast.success(title, {
      ...options,
      description,
    });
  }

  error(title: string, description?: string, options?: ExternalToast): string | number {
    return toast.error(title, {
      ...options,
      description,
    });
  }

  danger(title: string, description?: string, options?: ExternalToast): string | number {
    return this.error(title, description, options);
  }

  info(title: string, description?: string, options?: ExternalToast): string | number {
    return toast.info(title, {
      ...options,
      description,
    });
  }

  primary(title: string, description?: string, options?: ExternalToast): string | number {
    return this.info(title, description, options);
  }

  warning(title: string, description?: string, options?: ExternalToast): string | number {
    return toast.warning(title, {
      ...options,
      description,
    });
  }
}
