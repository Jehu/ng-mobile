/**
 * Default Controller for the start page
 */
function DefaultCntl($scope, $location) {
    // Set partials for Header and Footer in MainCntl
    $scope.setHeaderText('Start');

    $scope.setPartial('header', 'partials/default_header.html');
    $scope.setPartial('footer', 'partials/default_footer.html');
}

function DemoCntl($scope) {
    $scope.setHeaderText('Custom Header with back-btn');
}

function FormCntl($scope) {
    $scope.setHeaderText('Form Demo');
}

function ListCntl($scope) {
    $scope.setHeaderText('A List Demo');

    $scope.listData = [{
        'title':'Title #1'
        ,'text':'This ist the Text #1'
    },{
        'title':'Title #2'
        ,'text':'This ist the Text #2'
    },{
        'title':'Title #3'
        ,'text':'This ist the Text #3'
    },{
        'title':'Title #4'
        ,'text':'This ist the Text #4'
    },{
        'title':'Title #5'
        ,'text':'This ist the Text #5'
    }];
}
