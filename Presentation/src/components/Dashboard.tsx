import { FC } from 'react';
import ChartComponent, { ChartComponentProps } from './Chart/ChartComponent';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { Link } from 'react-router-dom';

const Dashboard: FC = () => {
  const chartProps: ChartComponentProps = {
    type: 'bar',
    barChartProps: {
      labels: [ 'M', 'T', 'W', 'T', 'F', 'S', 'S' ],
      data: [ 50, 20, 10, 22, 50, 10, 40 ],
      label: 'Sales',
    },
  };

  const Card = ({ type, title, value, icon, link, linkName }: {type: string, title: string, value: number, icon: JSX.Element, link: string, linkName: string }) => {
    return (
      <>
        <div className='col-md-4 col-sm-12 mb-xl-0 mb-4'>
          <div className='card'>
            <div className='card-header p-3 pt-2'>
              <div className={`icon icon-lg icon-shape bg-gradient-${type} shadow-${type} text-center border-radius-xl mt-n4 position-absolute d-flex justify-content-center align-items-center`}>
                {icon}
              </div>
              <div className='text-end pt-1'>
                <p className='text-sm mb-0 text-capitalize'>{title}</p>
                <h4 className='mb-0'>{value}</h4>
              </div>
            </div>
            <hr className='dark horizontal my-0' />
            <div className='card-footer p-3'>
              <p className='mb-0'>
                <Link className='text-sm' to={link}>{linkName}</Link>
              </p>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <div className='container-fluid py-4'>
        <div className='row'>

          <Card type='primary' title='Total Users' value={2} icon={<PeopleAltIcon className='text-white' />} link='/users' linkName='View all' />
          <Card type='success' title='Total Teachers' value={2} icon={<PeopleAltIcon className='text-white' />} link='/teachers' linkName='View all' />
          <Card type='info' title='Total Students' value={2} icon={<PeopleAltIcon className='text-white' />} link='/students' linkName='View all' />

        </div>
        <div className='row mt-4'>
          <div className='col-lg-4 col-md-6 mt-4 mb-4'>
            <div className='card z-index-2 '>
              <div className='card-header p-0 position-relative mt-n4 mx-3 z-index-2 bg-transparent'>
                <div className='bg-gradient-primary shadow-primary border-radius-lg py-3 pe-1'>
                  <div className='chart'>
                    <div style={{height: '180px'}}>
                      <ChartComponent {...chartProps} />
                    </div>
                  </div>
                </div>
              </div>
              <div className='card-body'>
                <h6 className='mb-0 '>Website Views</h6>
                <p className='text-sm '>Last Campaign Performance</p>
                <hr className='dark horizontal' />
                <div className='d-flex '>
                  <i className='material-icons text-sm my-auto me-1'>schedule</i>
                  <p className='mb-0 text-sm'> campaign sent 2 days ago</p>
                </div>
              </div>
            </div>
          </div>
          <div className='col-lg-4 col-md-6 mt-4 mb-4'>
            <div className='card z-index-2  '>
              <div className='card-header p-0 position-relative mt-n4 mx-3 z-index-2 bg-transparent'>
                <div className='bg-gradient-success shadow-success border-radius-lg py-3 pe-1'>
                  <div className='chart'>
                    <canvas id='chart-line' className='chart-canvas' height='170'></canvas>
                  </div>
                </div>
              </div>
              <div className='card-body'>
                <h6 className='mb-0 '> Daily Sales</h6>
                <p className='text-sm '> (
                  <span className='font-weight-bolder'>+15%</span>
                  ) increase in today sales.
                </p>
                <hr className='dark horizontal' />
                <div className='d-flex '>
                  <i className='material-icons text-sm my-auto me-1'>schedule</i>
                  <p className='mb-0 text-sm'> updated 4 min ago</p>
                </div>
              </div>
            </div>
          </div>
          <div className='col-lg-4 mt-4 mb-3'>
            <div className='card z-index-2 '>
              <div className='card-header p-0 position-relative mt-n4 mx-3 z-index-2 bg-transparent'>
                <div className='bg-gradient-dark shadow-dark border-radius-lg py-3 pe-1'>
                  <div className='chart'>
                    <canvas id='chart-line-tasks' className='chart-canvas' height='170'></canvas>
                  </div>
                </div>
              </div>
              <div className='card-body'>
                <h6 className='mb-0 '>Completed Tasks</h6>
                <p className='text-sm '>Last Campaign Performance</p>
                <hr className='dark horizontal' />
                <div className='d-flex '>
                  <i className='material-icons text-sm my-auto me-1'>schedule</i>
                  <p className='mb-0 text-sm'>just updated</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='row mb-4'>
          <div className='col-lg-8 col-md-6 mb-md-0 mb-4'>
            <div className='card'>
              <div className='card-header pb-0'>
                <div className='row'>
                  <div className='col-lg-6 col-7'>
                    <h6>Projects</h6>
                    <p className='text-sm mb-0'>
                      <i className='fa fa-check text-info' aria-hidden='true'></i>
                      <span className='font-weight-bold ms-1'>30 done</span>
                      this month
                    </p>
                  </div>
                  <div className='col-lg-6 col-5 my-auto text-end'>
                    <div className='dropdown float-lg-end pe-4'>
                      <a className='cursor-pointer' id='dropdownTable' data-bs-toggle='dropdown' aria-expanded='false'>
                        <i className='fa fa-ellipsis-v text-secondary'></i>
                      </a>
                      <ul className='dropdown-menu px-2 py-3 ms-sm-n4 ms-n5' aria-labelledby='dropdownTable'>
                        <li>
                          <a className='dropdown-item border-radius-md' href='/notAvailable'>Action</a>
                        </li>
                        <li>
                          <a className='dropdown-item border-radius-md' href='/notAvailable'>Another action</a>
                        </li>
                        <li>
                          <a className='dropdown-item border-radius-md' href='/notAvailable'>Something else here</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className='card-body px-0 pb-2'>
                <div className='table-responsive'>
                  <table className='table align-items-center mb-0'>
                    <thead>
                    <tr>
                      <th className='text-uppercase text-secondary text-xxs font-weight-bolder opacity-7'>Companies</th>
                      <th className='text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2'>Members</th>
                      <th className='text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7'>Budget</th>
                      <th className='text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7'>Completion</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                      <td>
                        <div className='d-flex px-2 py-1'>
                          <div>
                            <img src='../src/img/small-logos/logo-xd.svg' className='avatar avatar-sm me-3' alt='xd' />
                          </div>
                          <div className='d-flex flex-column justify-content-center'>
                            <h6 className='mb-0 text-sm'>Material XD Version</h6>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className='avatar-group mt-2'>
                          <a
                            href='/notAvailable'
                            className='avatar avatar-xs rounded-circle'
                            data-bs-toggle='tooltip'
                            data-bs-placement='bottom'
                            title='Ryan Tompson'
                          >
                            <img src='../src/img/team-1.jpg' alt='team1' />
                          </a>
                          <a
                            href='/notAvailable'
                            className='avatar avatar-xs rounded-circle'
                            data-bs-toggle='tooltip'
                            data-bs-placement='bottom'
                            title='Romina Hadid'
                          >
                            <img src='../src/img/team-2.jpg' alt='team2' />
                          </a>
                          <a
                            href='/notAvailable'
                            className='avatar avatar-xs rounded-circle'
                            data-bs-toggle='tooltip'
                            data-bs-placement='bottom'
                            title='Alexander Smith'
                          >
                            <img src='../src/img/team-3.jpg' alt='team3' />
                          </a>
                          <a
                            href='/notAvailable'
                            className='avatar avatar-xs rounded-circle'
                            data-bs-toggle='tooltip'
                            data-bs-placement='bottom'
                            title='Jessica Doe'
                          >
                            <img src='../src/img/team-4.jpg' alt='team4' />
                          </a>
                        </div>
                      </td>
                      <td className='align-middle text-center text-sm'>
                        <span className='text-xs font-weight-bold'> $14,000 </span>
                      </td>
                      <td className='align-middle'>
                        <div className='progress-wrapper w-75 mx-auto'>
                          <div className='progress-info'>
                            <div className='progress-percentage'>
                              <span className='text-xs font-weight-bold'>60%</span>
                            </div>
                          </div>
                          <div className='progress'>
                            <div
                              className='progress-bar bg-gradient-info w-60'
                              role='progressbar'
                              aria-valuenow={60}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <div className='d-flex px-2 py-1'>
                          <div>
                            <img
                              src='../src/img/small-logos/logo-spotify.svg'
                              className='avatar avatar-sm me-3'
                              alt='spotify'
                            />
                          </div>
                          <div className='d-flex flex-column justify-content-center'>
                            <h6 className='mb-0 text-sm'>Launch our Mobile App</h6>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className='avatar-group mt-2'>
                          <a
                            href='/notAvailable'
                            className='avatar avatar-xs rounded-circle'
                            data-bs-toggle='tooltip'
                            data-bs-placement='bottom'
                            title='Ryan Tompson'
                          >
                            <img src='../src/img/team-4.jpg' alt='user1' />
                          </a>
                          <a
                            href='/notAvailable'
                            className='avatar avatar-xs rounded-circle'
                            data-bs-toggle='tooltip'
                            data-bs-placement='bottom'
                            title='Romina Hadid'
                          >
                            <img src='../src/img/team-3.jpg' alt='user2' />
                          </a>
                          <a
                            href='/notAvailable'
                            className='avatar avatar-xs rounded-circle'
                            data-bs-toggle='tooltip'
                            data-bs-placement='bottom'
                            title='Alexander Smith'
                          >
                            <img src='../src/img/team-4.jpg' alt='user3' />
                          </a>
                          <a
                            href='/notAvailable'
                            className='avatar avatar-xs rounded-circle'
                            data-bs-toggle='tooltip'
                            data-bs-placement='bottom'
                            title='Jessica Doe'
                          >
                            <img src='../src/img/team-1.jpg' alt='user4' />
                          </a>
                        </div>
                      </td>
                      <td className='align-middle text-center text-sm'>
                        <span className='text-xs font-weight-bold'> $20,500 </span>
                      </td>
                      <td className='align-middle'>
                        <div className='progress-wrapper w-75 mx-auto'>
                          <div className='progress-info'>
                            <div className='progress-percentage'>
                              <span className='text-xs font-weight-bold'>100%</span>
                            </div>
                          </div>
                          <div className='progress'>
                            <div
                              className='progress-bar bg-gradient-success w-100'
                              role='progressbar'
                              aria-valuenow={100}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>

                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div className='col-lg-4 col-md-6'>
            <div className='card h-100'>
              <div className='card-header pb-0'>
                <h6>Orders overview</h6>
                <p className='text-sm'>
                  <i className='fa fa-arrow-up text-success' aria-hidden='true'></i>
                  <span className='font-weight-bold'>24%</span>
                  this month
                </p>
              </div>
              <div className='card-body p-3'>
                <div className='timeline timeline-one-side'>

                  <div className='timeline-block mb-3'>
                    <span className='timeline-step'>
                      <i className='material-icons text-success text-gradient'>notifications</i>
                    </span>
                    <div className='timeline-content'>
                      <h6 className='text-dark text-sm font-weight-bold mb-0'>$2400, Design changes</h6>
                      <p className='text-secondary font-weight-bold text-xs mt-1 mb-0'>22 DEC 7:20 PM</p>
                    </div>
                  </div>

                  <div className='timeline-block mb-3'>
                    <span className='timeline-step'>
                      <i className='material-icons text-danger text-gradient'>code</i>
                    </span>
                    <div className='timeline-content'>
                      <h6 className='text-dark text-sm font-weight-bold mb-0'>New order #1832412</h6>
                      <p className='text-secondary font-weight-bold text-xs mt-1 mb-0'>21 DEC 11 PM</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;