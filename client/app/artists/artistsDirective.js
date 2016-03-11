angular.module('jamApp')
    .directive('ajaxImg', ['$http', 'ArtistInfo',
        function($http, ArtistInfo, $compile) {
            var images = ['../../assets/concertheartsSmall.png', '../../assets/concerpic.png', '../../assets/concert1.jpeg', '../../assets/concert4.jpeg'];

            var defaultImg = images[parseInt(Math.random() * 4)];
            return {
                scope: {
                    artistId: "=ajaxImg",
                    src: '=ngSrc'
                },
                link: function(scope, element, attrs, controllers) {
                    ArtistInfo.getInfo(scope.artistId)
                        .then(function(info) {
                            if (info.status === 'found your pic bruh') {
                                attrs.$set('ngSrc', info.image);
                            }
                        })
                        .catch(function(err) {
                            scope.nopic = true;
                            attrs.$set('ngSrc', images[parseInt(Math.random() * 4)]);
                        });
                }

            };
        }
    ]);