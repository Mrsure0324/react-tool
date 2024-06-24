import { IRoute, Outlet } from 'umi'
import {store} from '@/store';
import { Provider } from 'react-redux';


export default function Layout({ children, location, route, history, match }: IRoute) {
    return <Provider store={store}><Outlet/></Provider>
}