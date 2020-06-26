import React, { FC } from 'react';

import { BaseProps } from '../Base';
import { StyledBadge } from './Styled';

export interface BadgeProps extends BaseProps {
  value: string | number;
  status?: "default" | "alert";
}

export const Badge: FC<BadgeProps> = ({ value, status = "default", className, tag, ...rest }) => {
  return (
    <StyledBadge className={className || ''} as={tag} status={status} data-testid='badge' {...rest}>
      {value}
    </StyledBadge>
  );
};

Badge.displayName = 'Badge';

export default Badge;