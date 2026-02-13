import React from 'react'
import SalesStatisticOne from '../components/SalesStatisticOne';
import UsersOverviewOne from '../components/UsersOverviewOne';
import EmployeeDashbaordData from './EmployeeDashbaordData';
import UnitCountOne from '../components/UnitCountOne';
import UsersOverviewTwo from '../components/UsersOverviewTwo';

const DashBoardLayerOne = () => {

    return (
        <>
            {/* UnitCountOne */}
            <UnitCountOne />

            <section className="row gy-4 mt-1">

                {/* SalesStatisticOne */}
                <SalesStatisticOne />
                
                {/* LatestRegisteredOne */}
                <EmployeeDashbaordData/>

            </section>
        </>


    )
}

export default DashBoardLayerOne