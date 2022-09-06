import apiRoutes from './api';
import billingRoutes from './billing';
import oauthRoutes from './oauth';

export default Object.assign({}, apiRoutes, billingRoutes, oauthRoutes);
