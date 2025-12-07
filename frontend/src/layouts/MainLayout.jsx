import { Outlet } from "react-router-dom";
import Footer from "../components/common/Footer";
import Header from "../components/common/Header";

function MainLayout() {
    return (
        <>
            <Outlet />
            <Footer />
        </>
    );
}
export default MainLayout;