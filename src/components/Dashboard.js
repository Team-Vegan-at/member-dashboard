/* eslint-disable react/jsx-no-comment-textnodes */
import React, { Component } from 'react';

import { DataTable } from 'primereact/datatable';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { ColumnGroup } from 'primereact/columngroup';
import { Row } from 'primereact/row';
import { Dropdown } from 'primereact/dropdown';
// import { MultiSelect } from 'primereact/multiselect';
import { Tooltip } from 'primereact/tooltip';

import { MembersService } from '../services/MembersService';
import { CalcUtil } from '../utils/calc.util';

export class Dashboard extends Component {

    constructor() {
        super();

        this.onPaymentStatusChange = this.onPaymentStatusChange.bind(this);
        this.onSubscriptionStatusChange = this.onSubscriptionStatusChange.bind(this);
        this.onMembershipYearChange = this.onMembershipYearChange.bind(this);
        this.service = new MembersService();

        // Export (https://www.primefaces.org/primereact/datatable/export/)
        this.exportCSV = this.exportCSV.bind(this);
        this.exportPdf = this.exportPdf.bind(this);
        this.exportExcel = this.exportExcel.bind(this);
        this.exportColumns = [
            { field: 'name', header: 'Name' },
            { field: 'email', header: 'Email' },
            { field: 'dob', header: 'Date of birth' },
            { field: 'paid', header: 'Paid' }
        ];
        this.exportColumns = this.exportColumns.map(col => (
            { title: col.header, dataKey: col.field }
        ));

        // Column Toggle (https://www.primefaces.org/primereact/datatable/coltoggle/)
        this.toggleColumns = [
            { field: 'actions', header: 'actions' },
            { field: 'dob', header: 'dob' }
        ];
        
        this.state = {
            members: null,
            numberOfMembers: 0,
            loading: true,
            selectedColumns: this.toggleColumns,
            selectedPaymentState: null,
            selectedSubscriptionState: null,
            selectedMembershipYearState: CalcUtil.getCurrentMembershipYear().toString(),
            paymentState: [
                { label: 'Paid', value: 'true' },
                { label: 'Not Paid', value: 'false' },
            ],
            subscriptionState: [
                { label: 'Yes', value: 'true' },
                { label: 'No', value: 'false' },
            ],
            membershipYearState: [
                { label: 'Membership Year 2020', value: '2020' },
                { label: 'Membership Year 2021', value: '2021' },
                { label: 'Membership Year 2022', value: '2022' },
                { label: 'Membership Year 2023', value: '2023' }
            ],
            selectedDiscourseId: null,
        };

        this.onColumnToggle = this.onColumnToggle.bind(this);
    }


    componentDidMount() {
        this.service.getMembers().then(data => this.setState(
            {
                members: data,
                loading: false
            }
        ));

        this.service.getNumberOfMembers().then(data => this.setState(
            {
                numberOfMembers: data
            }
        ));
    }

    suspend(userId) {
        this.loading = true;
        this.service.suspendMember(userId).then(data => this.setState({
            loading: false
        }))
    }

    unsuspend(userId) {
        this.loading = true;
        this.service.unsuspendMember(userId).then(data => this.setState({
            loading: false
        }))
    }

    exportCSV(selectionOnly) {
        this.dt.exportCSV();
    }

    exportPdf() {
        import('jspdf').then(jsPDF => {
            import('jspdf-autotable').then(() => {
                const doc = new jsPDF.default("landscape", "mm");
                doc.autoTable(
                    this.exportColumns,
                    this.state.members
                    );
                doc.save(`members-${this.state.selectedMembershipYearState}_export.pdf`);
            })
        })
    }

    exportExcel() {
        import('xlsx').then(xlsx => {
            const worksheet = xlsx.utils.json_to_sheet(this.state.members);
            const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
            const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
            this.saveAsExcelFile(excelBuffer, `members-${this.state.selectedMembershipYearState}`);
        });
    }

    saveAsExcelFile(buffer, fileName) {
        import('file-saver').then(FileSaver => {
            let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
            let EXCEL_EXTENSION = '.xlsx';
            const data = new Blob([buffer], {
                type: EXCEL_TYPE
            });
            FileSaver.default.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
        });
    }

    onColumnToggle(event) {
        let selectedColumns = event.value;
        let orderedSelectedColumns = this.toggleColumns.filter(col => selectedColumns.some(sCol => sCol.field === col.field));
        this.setState({ selectedColumns: orderedSelectedColumns });
    }

    onPaymentStatusChange(event) {
        this.dt.filter(event.value, 'paid', 'equals');
        this.setState({selectedPaymentState: event.value});
    }

    onSubscriptionStatusChange(event) {
        this.dt.filter(event.value, 'activeSubscription', 'equals');
        this.setState({selectedSubscriptionState: event.value});
    }

    onDiscourseStatusChange(event) {
        if (event.value === 'na') {
            this.dt.filter(null, 'discourse.id', 'equals');
        } else if (event.value === 'suspended') {
            this.dt.filter(null, 'discourse.suspended_at', 'equals');
        } else {
            this.dt.filter("*.", 'discourse.suspended_at', 'equals');
        }
        this.setState({selectedDiscourseState: event.value});
    }

    onMembershipYearChange(event) {
        this.setState({ loading: true });
        this.setState({selectedMembershipYearState: event.value});
        this.service.getMembers(event.value).then(data => this.setState(
            {
                members: data,
                loading: false
            }
        ));
        this.service.getNumberOfMembers(event.value).then(data => this.setState(
            {
                numberOfMembers: data
            }
        ));  
    }

    paymentStatusTemplate(rowData, column) {
        if (rowData['paid'] === true) {
            return <i className="pi pi-check"/>
        } else {
            return <i className="pi pi-times"/>
        }
    }

    subscriptionStatusTemplate(rowData, column) {
        if (rowData['subscription'] && Object.keys(rowData['subscription']).length > 0) {
            return <i className="pi pi-check"/>
        } else {
            return <i className="pi pi-times"/>
        }
    }

    dateTemplate(rowData, column) {
        if (rowData['payment'] && Object.keys(rowData['payment']).includes('paidAt')) {
            let dateFormat = rowData['payment']['paidAt'];
            if (dateFormat) {
                dateFormat = dateFormat.substr(0, 10);
            }
            return dateFormat;
        } else {
            return <p></p>
        }
    }

    discourseStatusTemplate(rowData, column) {
        if (!rowData['discourse']['id']) {
            return (
                <div>
                    <Tooltip target=".noUserClass" position="left" />
                    <i className="pi pi-user-minus noUserClass"
                      data-pr-tooltip="Not registered in forum" />
                </div>
            );
        } else if (rowData['discourse']['suspended_at']) {
            return ( 
                <div>
                    <Tooltip target=".forumSuspendedClass" position="left" />
                    <i className="pi pi-times forumSuspendedClass"
                        data-pr-tooltip="Forum user suspended" />
                </div>
            );
        } else {
            return (
                <div>
                    <Tooltip target=".forumActiveClass" position="left" />
                    <i className="pi pi-check forumActiveClass"
                        data-pr-tooltip="Forum user active" />
                </div>
            );
        }
    }

    actionsMollieTemplate(rowData, column) {
        if (rowData.mollieCustId !== undefined) {
            return ( 
                <div>
                    <Tooltip target=".actionsClass" position="left" />
                    <a  target="_blank"
                        rel="noreferrer"
                        href={ `https://www.mollie.com/dashboard/org_7157271/customers/${rowData.mollieCustId}` }
                        alt="Open in Mollie"
                        data-pr-tooltip="Open in Mollie"
                        className="actionsClass"
                    >
                        <img src="./mollie.png" alt="Mollie logo" style={{ width: 50 + 'px' }} />
                    </a>                        
                </div>
            );
        }
    }

    actionsMailchimpTemplate(rowData, column) {
        if (rowData.mailchimpId !== undefined) {
            return ( 
                <div>
                    <Tooltip target=".actionsClass" position="left" />
                    <a  target="_blank"
                        rel="noreferrer"
                        href={ `https://us4.admin.mailchimp.com/lists/members/view?id=${rowData.mailchimpId}&use_segment=Y` }
                        alt="Open in Mailchimp"
                        data-pr-tooltip="Open in Mailchimp"
                        className="actionsClass"
                    >
                        <img src="./mailchimp.png" alt="Mailchimp logo" style={{ width: 40 + 'px' }} />
                    </a>                        
                </div>
            );
        } 
    }

    actionsDiscourseTemplate(rowData, column) {
        if (!rowData['discourse']['id']) {
        } else if (rowData['discourse']['suspended_at']) {
            return ( 
                <div>
                    <Button className="p-button-success p-button-raised p-button-rounded" 
                            icon="pi pi-unlock" type="button" tooltip="Unsuspend forum user" 
                            tooltipOptions={{ position: "left" }}
                            onClick={() => this.unsuspend(rowData['discourse']['id'])}/>
                </div>
            );
        } else {
            return (
                <div>
                    <Button className="p-button-danger p-button-raised p-button-rounded" 
                            icon="pi pi-lock" type="button" tooltip="Suspend forum user" 
                            tooltipOptions={{ position: "left" }}
                            onClick={() => this.suspend(rowData['discourse']['id'])}/>
                </div>
            );
        }
    }

    render() {
        const paymentStateFilter =
            <Dropdown style={{width: '100%'}} placeholder="filter" 
                value={this.state.selectedPaymentState} options={this.state.paymentState} onChange={this.onPaymentStatusChange} showClear />;
        // const subscriptionStateFilter =
        //     <Dropdown style={{width: '100%'}} placeholder="filter" 
        //         value={this.state.selectedSubscriptionState} options={this.state.subscriptionState} onChange={this.onSubscriptionStatusChange} showClear />;

        const header = (
            <div className="left-50">
                <div className="flex flex-row flex-wrap card-container blue-container">
                    <Button type="button" icon="pi pi-file" onClick={() => this.exportCSV(false)} className="p-button-secondary mr-2" data-pr-tooltip="CSV" tooltip="CSV" />
                    <Button type="button" icon="pi pi-file-excel" onClick={this.exportExcel} className="p-button-success mr-2" data-pr-tooltip="XLS" tooltip="XLS" />
                    <Button type="button" icon="pi pi-file-pdf" onClick={this.exportPdf} className="p-button-warning  mr-2" data-pr-tooltip="PDF" tooltip="PDF" />

                    {/*<MultiSelect value={this.state.selectedColumns} options={this.toggleColumns} optionLabel="header" onChange={this.onColumnToggle} style={{width:'20em'}}/>*/}

                    <Dropdown 
                        value={this.state.selectedMembershipYearState} options={this.state.membershipYearState} onChange={this.onMembershipYearChange} />
                    <div className="activemembers">Active members: {this.state.numberOfMembers}</div>
                </div>
            </div>);

        // const columnComponents = this.state.selectedColumns.map(col=> {
        //     return <Column key={col.field} field={col.field} header={col.header} />;
        // });
        // const toggleActions = this.state.selectedColumns.map(col => {
        //     return <Column field="actions" colSpan={3} />
        // });

        const headerGroup = (
            <ColumnGroup>

                <Row>
                    <Column header="name" rowSpan={2} field="name" sortable />
                    <Column header="email" rowSpan={2} field="email" sortable />
                    <Column header="dob" rowSpan={2} field="dob" sortable />
                    <Column header={ `membership ${this.state.selectedMembershipYearState}` } colSpan={2} />
                    <Column header="forum" />
                    <Column header="actions" rowSpan={2} colSpan={3} field="actions" />
                </Row>
                <Row>
                    <Column header="paid" field="paid" sortable />
                    {/*<Column header="dd" field="activeSubscription" sortable />*/}
                    {/*<Column header="amount" field="payment.amount" sortable />*/}
                    <Column header="date" field="payment.paidAt" sortable />
                    <Column header="username" field="discourse.username" sortable />
                </Row>
                <Row>
                    
                    <Column field="name"
                            filter
                            filterPlaceholder="filter"
                            filterMatchMode="contains" />

                    <Column field="email"
                            filter
                            filterPlaceholder="filter"
                            filterMatchMode="contains" />

                    <Column field="dob"
                            filter
                            filterPlaceholder="filter"
                            filterMatchMode="contains" />

                    <Column field="paid"
                            filter
                            filterElement={paymentStateFilter} />

                    {/*<Column field="activeSubscription" */}
                    {/*        filter*/}
                    {/*        filterElement={subscriptionStateFilter}  />*/}
                    
                    {/*<Column field="payment.amount" */}
                    {/*        filter /> */}

                    <Column field="payment.paidAt"
                            filter
                            filterPlaceholder="filter"
                            filterMatchMode="contains"/>

                    <Column field="discourse.username" 
                            filter
                            filterPlaceholder="filter"
                            filterMatchMode="contains" />

                    {/* {toggleActions} */}
                    <Column field="actions" colSpan={3} />
                </Row>
            </ColumnGroup>);

        return (
            <DataTable 
                value={this.state.members}
                sortField="payment.paidAt" sortOrder={-1}
                paginator
                showGridlines
                responsiveLayout="scroll"
                responsive
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                rows={25}
                rowsPerPageOptions={[10,25,50,100,500]}
                header={header}
                headerColumnGroup={headerGroup}
                ref={(el) => { this.dt = el; }}
                emptyMessage="No records found"
                loading={this.state.loading}
                autoLayout={true}
                className="p-datatable-sm">

                <Column field="name" />
                <Column field="email" className="ellipsis" />
                <Column field="dob" />

                <Column field="paid" body={this.paymentStatusTemplate} />
                {/*<Column field="activeSubscription" body={this.subscriptionStatusTemplate} />*/}
                {/*<Column field="payment.amount" />*/}
                <Column field="payment.paidAt" body={this.dateTemplate} />

                <Column field="discourse.username" className="ellipsis" />
                
                <Column field="actionsMollie" body={this.actionsMollieTemplate.bind(this)} />
                <Column field="actionsMailchimp" body={this.actionsMailchimpTemplate.bind(this)} />
                <Column field="actionsDiscourse" body={this.actionsDiscourseTemplate.bind(this)} />
            </DataTable>
        );
    }
}
